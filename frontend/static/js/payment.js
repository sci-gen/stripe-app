document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const checkoutButton = document.getElementById('checkout-button');
    const invoiceButton = document.getElementById('invoice-button');
    const createInvoiceButton = document.getElementById('create-invoice');
    const invoiceForm = document.getElementById('invoice-form');
    const messageDiv = document.getElementById('message');
    
    // Stripeチェックアウトボタンのイベントリスナー
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            const amount = parseInt(document.getElementById('amount').value);
            
            if (isNaN(amount) || amount < 100) {
                showMessage('金額は100円以上で入力してください', 'error');
                return;
            }
            
            // チェックアウトセッションの作成をリクエスト
            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount
                }),
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(session) {
                if (session.error) {
                    showMessage('エラーが発生しました: ' + session.error, 'error');
                    return;
                }
                
                // Stripeチェックアウトにリダイレクト
                return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .then(function(result) {
                if (result && result.error) {
                    showMessage('エラーが発生しました: ' + result.error.message, 'error');
                }
            })
            .catch(function(error) {
                showMessage('エラーが発生しました: ' + error.message, 'error');
            });
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
        createInvoiceButton.addEventListener('click', function() {
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
            
            // 請求書作成をリクエスト
            fetch('/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    email: email,
                    description: description || '単発購入'
                }),
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.error) {
                    showMessage('エラーが発生しました: ' + data.error, 'error');
                    return;
                }
                
                showMessage('請求書が作成されました！', 'success');
                
                // 請求書URLがある場合は新しいタブで開く
                if (data.invoice_url) {
                    window.open(data.invoice_url, '_blank');
                }
            })
            .catch(function(error) {
                showMessage('エラーが発生しました: ' + error.message, 'error');
            });
        });
    }
    
    // メッセージ表示関数
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + (type === 'error' ? 'error-message' : 'success-message');
        messageDiv.classList.remove('hidden');
        
        // 5秒後にメッセージを非表示にする
        setTimeout(function() {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
    
    // メールアドレスバリデーション
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
