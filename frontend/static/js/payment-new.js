/**
 * Stripe決済システム - メインJavaScriptファイル
 * APIを使用して決済処理と請求書発行を行う
 */

// グローバル変数
let stripe = null;
let stripeConfig = null;

// DOM要素の取得
const elements = {
    checkoutButton: document.getElementById('checkout-button'),
    invoiceButton: document.getElementById('invoice-button'),
    createInvoiceButton: document.getElementById('create-invoice'),
    cancelInvoiceButton: document.getElementById('cancel-invoice'),
    invoiceForm: document.getElementById('invoice-form'),
    messageDiv: document.getElementById('message'),
    loadingDiv: document.getElementById('loading'),
    amountInput: document.getElementById('amount'),
    productNameInput: document.getElementById('product-name'),
    emailInput: document.getElementById('email'),
    descriptionInput: document.getElementById('description')
};

/**
 * 初期化処理
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Stripe設定を取得
        await loadStripeConfig();

        // Stripeインスタンスを初期化
        stripe = Stripe(stripeConfig.publishable_key);

        // イベントリスナーを設定
        setupEventListeners();

        showMessage('システムが正常に初期化されました', 'success');

    } catch (error) {
        console.error('初期化エラー:', error);
        showMessage('システムの初期化に失敗しました', 'error');
    }
});

/**
 * Stripe設定を取得
 */
async function loadStripeConfig() {
    try {
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/config`);

        if (!response.ok) {
            throw new Error('設定の取得に失敗しました');
        }

        stripeConfig = await response.json();

    } catch (error) {
        console.error('設定取得エラー:', error);
        throw error;
    }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // Stripe決済ボタン
    elements.checkoutButton?.addEventListener('click', handleCheckout);

    // 請求書発行ボタン
    elements.invoiceButton?.addEventListener('click', toggleInvoiceForm);

    // 請求書作成ボタン
    elements.createInvoiceButton?.addEventListener('click', handleCreateInvoice);

    // キャンセルボタン
    elements.cancelInvoiceButton?.addEventListener('click', hideInvoiceForm);

    // Enterキーでの送信
    elements.amountInput?.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleCheckout();
        }
    });
}

/**
 * Stripe決済処理
 */
async function handleCheckout() {
    try {
        const amount = parseInt(elements.amountInput.value);
        const productName = elements.productNameInput.value;

        // バリデーション
        if (!validateAmount(amount)) {
            showMessage('金額は100円以上で入力してください', 'error');
            return;
        }

        if (!productName.trim()) {
            showMessage('商品名を入力してください', 'error');
            return;
        }

        showLoading(true);

        // チェックアウトセッションの作成
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                product_name: productName,
                currency: 'jpy'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || '決済セッションの作成に失敗しました');
        }

        // Stripe Checkoutにリダイレクト
        const result = await stripe.redirectToCheckout({
            sessionId: data.session_id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('決済エラー:', error);
        showMessage(`決済エラー: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * 請求書フォームの表示/非表示
 */
function toggleInvoiceForm() {
    elements.invoiceForm?.classList.toggle('hidden');
    hideMessage();
}

/**
 * 請求書フォームを非表示
 */
function hideInvoiceForm() {
    elements.invoiceForm?.classList.add('hidden');
    // フォームをリセット
    elements.emailInput.value = '';
    elements.descriptionInput.value = '';
    hideMessage();
}

/**
 * 請求書作成処理
 */
async function handleCreateInvoice() {
    try {
        const amount = parseInt(elements.amountInput.value);
        const email = elements.emailInput.value;
        const description = elements.descriptionInput.value;

        // バリデーション
        if (!validateAmount(amount)) {
            showMessage('金額は100円以上で入力してください', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('有効なメールアドレスを入力してください', 'error');
            return;
        }

        if (!description.trim()) {
            showMessage('説明を入力してください', 'error');
            return;
        }

        showLoading(true);

        // 請求書作成のリクエスト
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/create-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                email: email,
                description: description,
                currency: 'jpy'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || '請求書の作成に失敗しました');
        }

        // 成功メッセージと請求書URLの表示
        showMessage('請求書が正常に作成されました！', 'success');

        // 請求書URLがある場合は新しいタブで開く
        if (data.invoice_url) {
            window.open(data.invoice_url, '_blank');
        }

        // フォームをリセット
        hideInvoiceForm();

    } catch (error) {
        console.error('請求書作成エラー:', error);
        showMessage(`請求書作成エラー: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * バリデーション関数
 */
function validateAmount(amount) {
    return !isNaN(amount) && amount >= 100;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * UI関数
 */
function showMessage(message, type) {
    if (elements.messageDiv) {
        elements.messageDiv.textContent = message;
        elements.messageDiv.className = `message ${type === 'error' ? 'error-message' : 'success-message'}`;
        elements.messageDiv.classList.remove('hidden');

        // 5秒後に非表示
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    elements.messageDiv?.classList.add('hidden');
}

function showLoading(show) {
    if (elements.loadingDiv) {
        if (show) {
            elements.loadingDiv.classList.remove('hidden');
        } else {
            elements.loadingDiv.classList.add('hidden');
        }
    }
}
