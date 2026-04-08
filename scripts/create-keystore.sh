#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE_PATH="$ROOT_DIR/android/app/xara-release.keystore"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}🔐 Criando keystore de produção para Xará${NC}"
echo ""

# Check if keystore already exists
if [[ -f "$KEYSTORE_PATH" ]]; then
  echo "${YELLOW}⚠️  Keystore já existe em: $KEYSTORE_PATH${NC}"
  read "response?Deseja sobrescrever? (s/N): "
  if [[ ! "$response" =~ ^[sS]$ ]]; then
    echo "Operação cancelada."
    exit 0
  fi
  rm -f "$KEYSTORE_PATH"
fi

# Set JAVA_HOME if not set
if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "❌ JAVA_HOME não configurado" >&2
  exit 1
fi

KEYTOOL="$JAVA_HOME/bin/keytool"

if [[ ! -f "$KEYTOOL" ]]; then
  echo "❌ keytool não encontrado em: $KEYTOOL" >&2
  exit 1
fi

# Keystore configuration
ALIAS="xara-key"
VALIDITY=10000 # ~27 anos

echo "Gerando keystore..."
echo ""
echo "${YELLOW}IMPORTANTE: Anote essas senhas em um lugar seguro!${NC}"
echo ""

# Generate keystore
"$KEYTOOL" -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY \
  -dname "CN=Xará, OU=Development, O=Xará, L=Brazil, ST=Brazil, C=BR"

echo ""
echo "${GREEN}✅ Keystore criado com sucesso!${NC}"
echo ""
echo "📍 Local: $KEYSTORE_PATH"
echo "🔑 Alias: $ALIAS"
echo ""
echo "${YELLOW}⚠️  IMPORTANTE: Faça backup deste arquivo!${NC}"
echo "Sem ele, você não conseguirá atualizar o app na Play Store."
echo ""
echo "Sugestão: Guarde em um gerenciador de senhas ou cloud seguro."
