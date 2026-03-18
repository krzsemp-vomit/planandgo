import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPlanEmail({
  to,
  customerName,
  city,
  days,
  pdfBuffer,
}: {
  to: string;
  customerName?: string;
  city: string;
  days: number;
  pdfBuffer: Buffer;
}) {
  const name = customerName || "Podróżniku";
  const filename = `PlanAndGo_${city}_${days}dni.pdf`;

  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Twój plan podróży jest gotowy!</title>
</head>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EC;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1710;border-radius:12px 12px 0 0;padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:900;color:#FAF7F2;letter-spacing:-0.5px;">
                      Plan<span style="color:#C9A84C;">&amp;</span>Go
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#8A8479;">planandgo.pl</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold bar -->
          <tr>
            <td style="background:#C9A84C;height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;">
                Twój plan jest gotowy ✦
              </p>

              <h1 style="margin:0 0 20px;font-size:28px;font-weight:900;color:#1A1710;line-height:1.2;">
                Cześć, ${name}!<br>
                <span style="color:#C9A84C;">${city}</span> czeka na Ciebie.
              </h1>

              <p style="margin:0 0 24px;font-size:15px;color:#6B6560;line-height:1.7;">
                Twój spersonalizowany plan zwiedzania <strong style="color:#1A1710;">${city}</strong>
                na <strong style="color:#1A1710;">${days} ${days === 1 ? "dzień" : days < 5 ? "dni" : "dni"}</strong>
                jest gotowy i czeka w załączniku.
              </p>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#FAF7F2;border-radius:10px;padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1A1710;">Co znajdziesz w środku:</p>
                    ${[
                      `Plan na ${days} ${days === 1 ? "dzień" : "dni"} krok po kroku`,
                      "Najciekawsze atrakcje z opisami i adresami",
                      "Polecane restauracje dopasowane do stylu",
                      "Info o transporcie i cenach wstępu",
                      "Praktyczne wskazówki lokalne",
                    ]
                      .map(
                        (item) =>
                          `<p style="margin:0 0 6px;font-size:13px;color:#6B6560;">
                        <span style="color:#C9A84C;margin-right:8px;">→</span>${item}
                      </p>`
                      )
                      .join("")}
                  </td>
                </tr>
              </table>

              <!-- CTA hint -->
              <p style="margin:0 0 32px;font-size:13px;color:#8A8479;line-height:1.6;">
                PDF możesz wydrukować lub mieć pod ręką na telefonie — działa offline.<br>
                Zalecamy zweryfikowanie godzin otwarcia atrakcji przed wizytą.
              </p>

              <hr style="border:none;border-top:1px solid #EDEAE4;margin:0 0 24px;">

              <p style="margin:0;font-size:13px;color:#8A8479;">
                Miłego zwiedzania! 🗺️<br>
                <strong style="color:#1A1710;">Zespół Plan&amp;Go</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F0EDE7;border-radius:0 0 12px 12px;padding:20px 36px;">
              <p style="margin:0;font-size:11px;color:#A09890;text-align:center;line-height:1.6;">
                Otrzymujesz ten email, ponieważ zamówiłeś plan podróży na planandgo.pl<br>
                © ${new Date().getFullYear()} Plan&amp;Go · planandgo.pl
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM || "plany@planandgo.pl",
    to,
    subject: `🗺️ Twój plan dla ${city} jest gotowy! — Plan&Go`,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
      },
    ],
  });

  return result;
}
