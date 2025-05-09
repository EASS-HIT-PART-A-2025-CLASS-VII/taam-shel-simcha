import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# טוען משתני סביבה מהקובץ .env
load_dotenv()

# משתני סביבה מהמייל
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))

def send_reset_email(to_email: str, reset_link: str):
   
    msg = EmailMessage()
    msg['Subject'] = 'איפוס סיסמה - טעם של שמחה 🍲'
    msg['From'] = f"טעם של שמחה <{EMAIL_ADDRESS}>"
    msg['To'] = to_email

    msg.set_content(f"""
היי 👋

קיבלת את המייל הזה כי ביקשת לאפס סיסמה באתר 'טעם של שמחה'.

להשלמת התהליך לחץ/י על הקישור הבא:

{reset_link}

אם לא אתה ביקשת – פשוט תתעלם.

בברכה,
צוות טעם של שמחה 💛
""")


    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print("✅ מייל נשלח בהצלחה!")
    except Exception as e:
        print("❌ שגיאה בשליחת מייל:", e)
