from fastapi import FastAPI, Request, Form, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import stripe
import os
import json
from config import STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY

# FastAPIアプリケーションの初期化
app = FastAPI(title="Stripe単発購入デモ")

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静的ファイルのマウント
app.mount("/static", StaticFiles(directory="../frontend/static"), name="static")

# テンプレートの設定
templates = Jinja2Templates(directory="../frontend/templates")

# Stripeの設定
stripe.api_key = STRIPE_SECRET_KEY

# ルート
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "key": STRIPE_PUBLISHABLE_KEY}
    )

# Stripe Checkoutセッションの作成
@app.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    try:
        # リクエストボディからJSONデータを取得
        data = await request.json()
        amount = data.get('amount', 1000)  # デフォルト1000円
        
        # Stripe Checkout Sessionの作成
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'jpy',
                    'product_data': {
                        'name': '単発購入',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{request.url.scheme}://{request.url.netloc}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{request.url.scheme}://{request.url.netloc}/",
        )
        
        return {"id": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

# 請求書の作成
@app.post("/create-invoice")
async def create_invoice(request: Request):
    try:
        # リクエストボディからJSONデータを取得
        data = await request.json()
        amount = data.get('amount', 1000)  # デフォルト1000円
        customer_email = data.get('email', 'customer@example.com')
        description = data.get('description', '単発購入')
        
        # 顧客の作成または取得
        customers = stripe.Customer.list(email=customer_email)
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(
                email=customer_email,
                description="単発購入の顧客"
            )
        
        # 請求アイテムの作成
        invoice_item = stripe.InvoiceItem.create(
            customer=customer.id,
            amount=amount,
            currency="jpy",
            description=description
        )
        
        # 請求書の作成
        invoice = stripe.Invoice.create(
            customer=customer.id,
            auto_advance=True,  # 自動的に確定する
        )
        
        # 請求書の確定と送信
        invoice = stripe.Invoice.finalize_invoice(invoice.id)
        
        return {
            'invoice_id': invoice.id,
            'invoice_url': invoice.hosted_invoice_url
        }
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

# 支払い成功ページ
@app.get("/success", response_class=HTMLResponse)
async def success(request: Request, session_id: Optional[str] = None):
    if session_id:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        return templates.TemplateResponse(
            "success.html", 
            {"request": request, "session": checkout_session}
        )
    return RedirectResponse(url="/")

# アプリケーションの実行（開発環境用）
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
