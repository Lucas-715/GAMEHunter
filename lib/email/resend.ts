import { Resend } from 'resend';

// Initialize the Resend client with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendPriceAlertEmail(
  userEmail: string,
  userName: string,
  gameName: string,
  targetPrice: number,
  currentPrice: number,
  storeName: string,
  storeUrl: string,
  coverImage?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email would have been sent to:", userEmail);
    return { success: true, dummy: true };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w-md: 600px; margin: 0 auto; background-color: #121214; color: #fff; padding: 24px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #22C55E; margin: 0;">GameHunter</h1>
        <p style="color: #a1a1aa; margin-top: 4px;">Seu alerta de preço foi atingido!</p>
      </div>
      
      <div style="background-color: #18181b; padding: 20px; border-radius: 8px; border: 1px solid #27272a;">
        <p style="font-size: 16px; margin-top: 0;">Olá ${userName || 'Caçador'},</p>
        <p style="font-size: 16px; color: #d4d4d8;">
          O jogo <strong>${gameName}</strong> atingiu o seu preço alvo!
        </p>

        ${coverImage ? `<img src="${coverImage}" alt="${gameName}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px; margin: 16px 0;" />` : ''}

        <div style="background-color: #27272a; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <div style="margin-bottom: 8px;">
            <span style="color: #a1a1aa; font-size: 14px;">Seu Preço Alvo:</span>
            <span style="float: right; font-weight: bold;">R$ ${targetPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <div>
            <span style="color: #a1a1aa; font-size: 14px;">Preço Atual:</span>
            <span style="float: right; font-weight: bold; color: #22C55E; font-size: 18px;">R$ ${currentPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #3f3f46;">
            <span style="color: #a1a1aa; font-size: 14px;">Loja:</span>
            <span style="float: right; font-weight: bold;">${storeName}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${storeUrl}" style="background-color: #22C55E; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Comprar Agora
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px; color: #71717a; font-size: 12px;">
        <p>Você recebeu este e-mail porque configurou um alerta no GameHunter.</p>
        <p>Para gerenciar seus alertas, acesse sua <a href="https://gamehunter.com.br/wishlist" style="color: #22C55E; text-decoration: none;">Dashboard</a>.</p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'GameHunter <onboarding@resend.dev>', // resend.dev allows testing without domain verification
      to: [userEmail],
      subject: `🎮 Alerta de Preço: ${gameName} por R$ ${currentPrice.toFixed(2).replace('.', ',')}!`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
