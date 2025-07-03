document.addEventListener('DOMContentLoaded', async function() {
    // URLパラメーターからセッションIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
        showMessage('セッションIDが見つかりません', 'error');
        return;
    }

    try {
        // セッション情報を取得
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GET_SESSION}/${sessionId}`);

        if (response.success) {
            displaySessionInfo(response.session);
        } else {
            showMessage('セッション情報の取得に失敗しました', 'error');
        }
    } catch (error) {
        showMessage('エラーが発生しました: ' + error.message, 'error');
    }

    function displaySessionInfo(session) {
        const sessionInfo = document.getElementById('session-info');
        const amount = session.amount_total ? (session.amount_total / 100).toLocaleString() : 'N/A';

        sessionInfo.innerHTML = `
            <div class="session-details">
                <h3>取引詳細</h3>
                <p><strong>セッションID:</strong> ${session.id}</p>
                <p><strong>支払い状況:</strong> ${getPaymentStatusText(session.payment_status)}</p>
                <p><strong>金額:</strong> ¥${amount}</p>
                <p><strong>通貨:</strong> ${session.currency.toUpperCase()}</p>
                ${session.customer_email ? `<p><strong>顧客メール:</strong> ${session.customer_email}</p>` : ''}
            </div>
        `;
    }

    function getPaymentStatusText(status) {
        switch (status) {
            case 'paid':
                return '✅ 支払い完了';
            case 'unpaid':
                return '❌ 未払い';
            case 'no_payment_required':
                return '✅ 支払い不要';
            default:
                return status;
        }
    }

    function showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}-message`;
        messageDiv.classList.remove('hidden');

        setTimeout(function() {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
});
