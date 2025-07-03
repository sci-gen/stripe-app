from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import stripe
import os
import json
from config import STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="Stripe Payment API",
    version="1.0.0",
    description="Stripe決済と請求書発行のためのREST API",
)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Stripeの設定
stripe.api_key = STRIPE_SECRET_KEY


# リクエストデータモデル
class CheckoutRequest(BaseModel):
    amount: int
    currency: str = "jpy"
    product_name: str = "単発購入"


class InvoiceRequest(BaseModel):
    amount: int
    email: str
    description: str = "単発購入"
    currency: str = "jpy"


# APIエンドポイント
@app.get("/api/config")
async def get_config():
    """Stripe設定情報を取得"""
    return {"publishable_key": STRIPE_PUBLISHABLE_KEY, "currency": "jpy"}


@app.post("/api/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    """Stripe Checkoutセッションを作成"""
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": request.currency,
                        "product_data": {
                            "name": request.product_name,
                        },
                        "unit_amount": request.amount,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/",
        )

        return {
            "success": True,
            "session_id": checkout_session.id,
            "checkout_url": checkout_session.url,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/create-invoice")
async def create_invoice(request: InvoiceRequest):
    """請求書を作成"""
    try:
        # 顧客の作成または取得
        customers = stripe.Customer.list(email=request.email)
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(
                email=request.email, description="単発購入の顧客"
            )

        # 請求アイテムの作成
        invoice_item = stripe.InvoiceItem.create(
            customer=customer.id,
            amount=request.amount,
            currency=request.currency,
            description=request.description,
        )

        # 請求書の作成
        invoice = stripe.Invoice.create(
            customer=customer.id,
            auto_advance=True,
        )

        # 請求書の確定
        invoice = stripe.Invoice.finalize_invoice(invoice.id)

        return {
            "success": True,
            "invoice_id": invoice.id,
            "invoice_url": invoice.hosted_invoice_url,
            "invoice_pdf": invoice.invoice_pdf,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/checkout-session/{session_id}")
async def get_checkout_session(session_id: str):
    """Checkoutセッション情報を取得"""
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        return {
            "success": True,
            "session": {
                "id": checkout_session.id,
                "payment_status": checkout_session.payment_status,
                "amount_total": checkout_session.amount_total,
                "currency": checkout_session.currency,
                "customer_email": (
                    checkout_session.customer_details.email
                    if checkout_session.customer_details
                    else None
                ),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# ヘルスチェック
@app.get("/api/health")
async def health_check():
    """APIヘルスチェック"""
    return {"status": "healthy", "message": "Stripe Payment API is running"}


# Root endpoint (API情報を返す)
@app.get("/")
async def root():
    """API情報を返す"""
    return {
        "message": "Stripe Payment API",
        "version": "1.0.0",
        "endpoints": {
            "config": "/api/config",
            "create_checkout": "/api/create-checkout-session",
            "create_invoice": "/api/create-invoice",
            "get_session": "/api/checkout-session/{session_id}",
            "health": "/api/health",
        },
    }


# アプリケーションの実行（開発環境用）
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
