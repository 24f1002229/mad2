import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER = "parking@app.com"
PASSWORD = ""


def send_email(to_address, subject, message, content="html", attachment_file=None):
    msg = MIMEMultipart()
    msg["From"] = SENDER
    msg["To"] = to_address
    msg["Subject"] = subject

    # body
    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    # attachment
    if attachment_file:
        with open(attachment_file, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())

        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{attachment_file}"')
        msg.attach(part)

    s = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    s.login(SENDER, PASSWORD)
    s.send_message(msg)
    s.quit()

    return True