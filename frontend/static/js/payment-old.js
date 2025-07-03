// Stripe インスタンス
let stripe = null;

document.addEventListener('DOMContentLoaded', async function() {
    // 設定を取得してStripeを初期化
    try {
        const config = await fetchConfig();
        stripe = Stripe(config.publishable_key);
        console.log('Stripe initialized successfully');
    } catch (error) {
        showMessage('設定の読み込みに失敗しました: ' + error.message, 'error');
        return;
    }

    // 要素の取得
    const checkoutButton = document.getElementById('checkout-button');
    const invoiceButton = document.getElementById('invoice-button');
    const createInvoiceButton = document.getElementById('create-invoice');
    const invoiceForm = document.getElementById('invoice-form');
    const messageDiv = document.getElementById('message');

    // Stripeチェックアウトボタンのイベントリスナー
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function() {
            const amount = parseInt(document.getElementById('amount').value);

            if (isNaN(amount) || amount < 100) {
                showMessage('金額は100円以上で入力してください', 'error');
                return;
            }

            try {
                showMessage('チェックアウトセッションを作成中...', 'info');

                // チェックアウトセッションを作成
                const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_CHECKOUT, {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: amount,
                        currency: 'jpy',
                        product_name: '単発購入'
                    })
                });

                if (response.success) {
                    // 新しいタブでStripe Checkoutを開く
                    window.open(response.checkout_url, '_blank');
                    showMessage('Stripe Checkoutを新しいタブで開きました', 'success');
                } else {
                    showMessage('エラーが発生しました', 'error');
                }
            } catch (error) {
                showMessage('エラーが発生しました: ' + error.message, 'error');
            }
        });
    }

    // 請求書ボタンのイベントリスナー
    if (invoiceButton) {
        invoiceButton.addEventListener('click', function() {
            invoiceForm.classList.toggle('hidden');
        });
    }

    // 請求書作成ボタンのイベントリスナー
    if (createInvoiceButton) {
        createInvoiceButton.addEventListener('click', async function() {
            const amount = parseInt(document.getElementById('amount').value);
            const email = document.getElementById('email').value;
            const description = document.getElementById('description').value;

            if (isNaN(amount) || amount < 100) {
                showMessage('金額は100円以上で入力してください', 'error');
                return;
            }

            if (!email || !validateEmail(email)) {
                showMessage('有効なメールアドレスを入力してください', 'error');
                return;
            }

            try {
                showMessage('請求書を作成中...', 'info');

                // 請求書を作成
                const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_INVOICE, {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: amount,
                        email: email,
                        description: description || '単発購入',
                        currency: 'jpy'
                    })
                });

                if (response.success) {
                    showMessage('請求書が作成されました！', 'success');

                    // 請求書URLがある場合は新しいタブで開く
                    if (response.invoice_url) {
                        window.open(response.invoice_url, '_blank');
                    }

                    // フォームをリセット
                    document.getElementById('email').value = '';
                    document.getElementById('description').value = '';
                    invoiceForm.classList.add('hidden');
                } else {
                    showMessage('請求書の作成に失敗しました', 'error');
                }
            } catch (error) {
                showMessage('エラーが発生しました: ' + error.message, 'error');
            }
        });
    }

    // メッセージ表示関数
    function showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}-message`;
        messageDiv.classList.remove('hidden');

        // 5秒後にメッセージを非表示にする（infoタイプ以外）
        if (type !== 'info') {
            setTimeout(function() {
                messageDiv.classList.add('hidden');
            }, 5000);
        }
    }

    // メールアドレスバリデーション
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // グローバルに公開
    window.showMessage = showMessage;
});
