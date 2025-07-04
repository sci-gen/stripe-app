import { useLocation, Link } from 'react-router-dom';
import type { InvoiceResponse } from '../types/stripe';

const SuccessPage = () => {
  const location = useLocation();
  // バックエンドからのレスポンスがネストされている可能性を考慮し、
  // location.state.invoice.invoice のように、一段深く参照する。
  // もしネストされていなければ、location.state.invoice をそのまま使う。
  const rawInvoiceData = location.state?.invoice;
  const invoice = (rawInvoiceData?.invoice ? rawInvoiceData.invoice : rawInvoiceData) as InvoiceResponse;


  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="text-red-600 text-6xl mb-4">
              ❌
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              請求書の情報が見つかりません。
            </p>
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="text-green-600 text-6xl mb-4">
            ✅
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            請求書が作成されました
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2 text-gray-900">請求書情報</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">請求書ID:</span> {invoice.id}
              </p>
              <div className="pt-2">
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    請求書を表示
                  </a>
                )}
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    PDFダウンロード
                  </a>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新しい請求書を作成
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;