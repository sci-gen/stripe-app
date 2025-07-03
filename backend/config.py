import os
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

# Stripe API Keys
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')

# アプリケーション設定
DEBUG = True
