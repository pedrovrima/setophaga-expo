import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Text, YStack, View } from 'tamagui';
import { tokens as t } from '~/src/theme/tokens';

export default function PrivacyPolicy() {
  return (
    <View flex={1} backgroundColor={t.colors.bg}>
      <Stack.Screen options={{ title: 'Política de Privacidade', headerShown: true }} />
      <ScrollView>
        <YStack padding={t.spacing.screenX} paddingTop={t.spacing.screenTop} maxWidth={800} alignSelf="center" gap="$4">

          <Text fontSize={28} fontWeight="bold" color={t.colors.text} marginBottom="$4">
            Política de Privacidade
          </Text>

          <Text fontSize={14} color={t.colors.textMuted} marginBottom="$6">
            Última atualização: 09 de abril de 2026
          </Text>

          {/* Introdução */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              1. Introdução
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Bem-vindo ao Xará! Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma colaborativa de nomes populares e sinônimos de aves brasileiras.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Ao utilizar o Xará, você concorda com os termos desta política. Se você não concordar com qualquer parte desta política, por favor, não utilize nossa plataforma.
            </Text>
          </YStack>

          {/* Responsável */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              2. Responsável pelos Dados
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              O responsável pela coleta e tratamento dos dados pessoais é o projeto Xará.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Para questões relacionadas à privacidade, entre em contato através do email: contato@xara.com.br
            </Text>
          </YStack>

          {/* Dados Coletados */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              3. Dados Coletados
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Coletamos as seguintes informações quando você utiliza o Xará:
            </Text>

            <YStack gap="$2" paddingLeft="$4">
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Email:</Text> Utilizado para autenticação e comunicação
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Nome (opcional):</Text> Para identificação no sistema
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Contribuições:</Text> Nomes populares e sinônimos que você registra
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Dados de uso:</Text> Informações sobre como você utiliza a plataforma
              </Text>
            </YStack>
          </YStack>

          {/* Como Usamos */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              4. Como Usamos Seus Dados
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Utilizamos seus dados pessoais para:
            </Text>

            <YStack gap="$2" paddingLeft="$4">
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Fornecer acesso à plataforma e suas funcionalidades
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Autenticar sua identidade e gerenciar sua conta
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Atribuir suas contribuições ao seu usuário
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Melhorar nossa plataforma e desenvolver novos recursos
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Comunicar atualizações importantes sobre o serviço
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • Prevenir fraudes e garantir a segurança da plataforma
              </Text>
            </YStack>
          </YStack>

          {/* Compartilhamento */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              5. Compartilhamento de Dados
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Seus dados podem ser compartilhados apenas nas seguintes situações:
            </Text>

            <YStack gap="$2" paddingLeft="$4">
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Contribuições públicas:</Text> Os nomes populares e sinônimos que você registra são visíveis para todos os usuários da plataforma
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Provedores de serviço:</Text> Utilizamos Supabase para autenticação e armazenamento de dados, que opera sob sua própria política de privacidade
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Obrigações legais:</Text> Quando exigido por lei ou para proteger nossos direitos legais
              </Text>
            </YStack>
          </YStack>

          {/* Armazenamento */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              6. Armazenamento e Segurança
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Seus dados são armazenados em servidores seguros fornecidos pelo Supabase, que utiliza criptografia e medidas de segurança padrão da indústria.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Todas as comunicações entre seu dispositivo e nossos servidores são criptografadas usando HTTPS.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Armazenamos seus dados pelo tempo necessário para fornecer o serviço ou conforme exigido por lei.
            </Text>
          </YStack>

          {/* Seus Direitos */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              7. Seus Direitos (LGPD)
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </Text>

            <YStack gap="$2" paddingLeft="$4">
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Acesso:</Text> Solicitar uma cópia dos seus dados pessoais
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Correção:</Text> Atualizar ou corrigir dados incorretos
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Exclusão:</Text> Solicitar a exclusão de seus dados
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Portabilidade:</Text> Receber seus dados em formato estruturado
              </Text>
              <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
                • <Text fontWeight="600">Revogação de consentimento:</Text> Retirar seu consentimento a qualquer momento
              </Text>
            </YStack>

            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24} marginTop="$2">
              Para exercer qualquer um destes direitos, entre em contato através do email: contato@xara.com.br
            </Text>
          </YStack>

          {/* Cookies */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              8. Cookies e Tecnologias Similares
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Utilizamos cookies e tecnologias similares para manter sua sessão ativa e melhorar sua experiência de uso. Você pode configurar seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades da plataforma.
            </Text>
          </YStack>

          {/* Dados de Teste */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              9. Período de Testes Beta
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Durante o período de testes beta, todos os dados cadastrados são considerados dados de teste e podem ser utilizados para aprimorar a plataforma. Os dados de teste podem ser modificados ou excluídos conforme necessário para melhorias do sistema.
            </Text>
          </YStack>

          {/* Menores */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              10. Menores de Idade
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Nosso serviço é destinado a usuários maiores de 18 anos. Não coletamos intencionalmente dados de menores de idade. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente.
            </Text>
          </YStack>

          {/* Alterações */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              11. Alterações nesta Política
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações significativas, notificaremos você por email ou através de um aviso em nossa plataforma.
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Recomendamos que você revise esta política regularmente para se manter informado sobre como protegemos seus dados.
            </Text>
          </YStack>

          {/* Contato */}
          <YStack gap="$3" marginTop="$4" marginBottom="$8">
            <Text fontSize={18} fontWeight="600" color={t.colors.text}>
              12. Contato
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais, entre em contato:
            </Text>
            <Text fontSize={15} color={t.colors.textSecondary} lineHeight={24}>
              Email: contato@xara.com.br
            </Text>
          </YStack>

        </YStack>
      </ScrollView>
    </View>
  );
}
