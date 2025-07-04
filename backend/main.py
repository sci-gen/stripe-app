from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import stripe
import os
import json
import logging
from config import STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY

# logging設定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

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
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
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
    send_email: bool = True


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
    logging.info(
        f"請求書作成リクエストを受信: email={request.email}, amount={request.amount}, send_email={request.send_email}"
    )
    # フロントエンドから受け取ったamountの値と型をログに出力して確認
    logging.info(f"受信した金額 (amount): {request.amount}, 型: {type(request.amount)}")
    try:
        # 顧客の作成または取得
        customers = stripe.Customer.list(email=request.email)
        if customers.data:
            customer = customers.data[0]
            logging.info(f"既存顧客が見つかりました: id={customer.id}")
        else:
            customer = stripe.Customer.create(
                email=request.email, description=f"Invoice for {request.email}"
            )
            logging.info(f"新規顧客を作成しました: id={customer.id}")

        # 1. まず下書き請求書を作成
        # collection_method='send_invoice' はStripeがメールを送信することを示す
        invoice = stripe.Invoice.create(
            customer=customer.id,
            collection_method="send_invoice",
            days_until_due=30,
        )
        logging.info(f"下書き請求書を作成しました: id={invoice.id}")

        # 2. 請求アイテムを作成し、下書き請求書に直接紐付ける
        invoice_item = stripe.InvoiceItem.create(
            customer=customer.id,
            amount=request.amount,
            currency=request.currency,
            description=request.description,
            invoice=invoice.id,  # ここで下書き請求書IDを指定
        )
        logging.info(
            f"請求アイテムを作成し、請求書 {invoice.id} に紐付けました: id={invoice_item.id}"
        )

        # 3. send_emailフラグに応じて、請求書を送信するか確定のみ行うか分岐
        if request.send_email:
            # 請求書を送信 (この処理が請求書を確定し、顧客にメールを送る)
            final_invoice = stripe.Invoice.send_invoice(invoice.id)
            logging.info(
                f"請求書を送信しました: id={final_invoice.id}, status={final_invoice.status}, url={final_invoice.hosted_invoice_url}, amount_due={final_invoice.amount_due}"
            )
        else:
            # 請求書を確定 (メールは送信しない)
            final_invoice = stripe.Invoice.finalize_invoice(invoice.id)
            logging.info(
                f"請求書を確定しました (メール未送信): id={final_invoice.id}, status={final_invoice.status}, url={final_invoice.hosted_invoice_url}, amount_due={final_invoice.amount_due}"
            )

        response_data = {"success": True, "invoice": final_invoice.to_dict()}
        logging.info(f"レスポンスを返します: invoice_id={final_invoice.id}")
        return JSONResponse(content=response_data)

    except Exception as e:
        logging.error(f"請求書作成中にエラーが発生: {e}", exc_info=True)
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
