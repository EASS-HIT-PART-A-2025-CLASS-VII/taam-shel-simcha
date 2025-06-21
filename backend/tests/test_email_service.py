import pytest
from unittest.mock import patch, MagicMock
from app.services import email as email_service

# ---- send_reset_email ----
@patch("smtplib.SMTP")
def test_send_reset_email_success(mock_smtp):
    mock_instance = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_instance

    email_service.send_reset_email("test@example.com", "https://example.com/reset")

    mock_instance.starttls.assert_called_once()
    mock_instance.login.assert_called_once()
    mock_instance.send_message.assert_called_once()

# ---- send_rating_notification_email ----
@patch("smtplib.SMTP")
def test_send_rating_notification_email_success(mock_smtp):
    mock_instance = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_instance

    email_service.send_rating_notification_email("test@example.com", "Pizza", 5)

    mock_instance.starttls.assert_called_once()
    mock_instance.login.assert_called_once()
    mock_instance.send_message.assert_called_once()

# ---- send_recipe_email_with_pdf ----
@patch("smtplib.SMTP")
@patch("app.services.email.HTML")
def test_send_recipe_email_with_pdf_success(mock_html_class, mock_smtp):
    mock_pdf = b"%PDF-1.4 fake pdf content"
    mock_html_instance = MagicMock()
    mock_html_instance.write_pdf.return_value = mock_pdf
    mock_html_class.return_value = mock_html_instance

    mock_smtp_instance = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_smtp_instance

    class DummyRecipe:
        title = "שקשוקה"
        description = "טעים מאוד"
        ingredients = "ביצים, עגבניות"
        instructions = "לטגן ולבשל"
        creator = type("User", (), {"username": "שף"})()

    email_service.send_recipe_email_with_pdf("test@example.com", DummyRecipe())

    mock_smtp_instance.send_message.assert_called_once()
    mock_html_instance.write_pdf.assert_called_once()

# ---- reverse_rtl ----
def test_reverse_rtl_text():
    text = "שלום"
    reversed_text = email_service.reverse_rtl(text)
    assert reversed_text == "םולש"



# ---- send_reset_email FAILURE ----
@patch("smtplib.SMTP")
def test_send_reset_email_failure(mock_smtp):
    mock_instance = MagicMock()
    mock_instance.login.side_effect = Exception("Login failed")
    mock_smtp.return_value.__enter__.return_value = mock_instance

    try:
        email_service.send_reset_email("test@example.com", "https://example.com/reset")
    except Exception:
        pytest.fail("send_reset_email זרקה חריגה למרות שהשגיאה מטופלת")

    mock_instance.send_message.assert_not_called()


# ---- send_rating_notification_email FAILURE ----
@patch("smtplib.SMTP")
def test_send_rating_notification_email_failure(mock_smtp):
    mock_instance = MagicMock()
    mock_instance.starttls.side_effect = Exception("TLS Error")
    mock_smtp.return_value.__enter__.return_value = mock_instance

    try:
        email_service.send_rating_notification_email("test@example.com", "Pizza", 5)
    except Exception:
        pytest.fail("send_rating_notification_email זרקה חריגה למרות שהשגיאה מטופלת")

    mock_instance.send_message.assert_not_called()


# ---- send_recipe_email_with_pdf FAILURE ----
@patch("smtplib.SMTP")
@patch("app.services.email.HTML")
def test_send_recipe_email_with_pdf_failure(mock_html_class, mock_smtp):
    mock_pdf = b"%PDF-1.4 fake pdf content"
    mock_html_instance = MagicMock()
    mock_html_instance.write_pdf.return_value = mock_pdf
    mock_html_class.return_value = mock_html_instance

    mock_smtp_instance = MagicMock()
    mock_smtp_instance.login.side_effect = Exception("SMTP Failure")
    mock_smtp.return_value.__enter__.return_value = mock_smtp_instance

    class DummyRecipe:
        title = "שקשוקה"
        description = "טעים מאוד"
        ingredients = "ביצים, עגבניות"
        instructions = "לטגן ולבשל"
        creator = type("User", (), {"username": "שף"})()

    try:
        email_service.send_recipe_email_with_pdf("test@example.com", DummyRecipe())
    except Exception:
        pytest.fail("send_recipe_email_with_pdf זרקה חריגה למרות שהשגיאה מטופלת")

    mock_smtp_instance.send_message.assert_not_called()
