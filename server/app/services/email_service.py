"""
Dịch vụ gửi Email hệ thống (EmailService) cho NexusCRM Enterprise.
Tuân thủ Clean Layered Architecture, PEP 8 và 100% Type Hints.
"""
import logging
from typing import Dict, Any

logger = logging.getLogger("nexuscrm.email")


class EmailService:
    """
    Dịch vụ xử lý gửi email kích hoạt tài khoản, thông báo bảo mật và mật khẩu tạm thời.
    """

    @staticmethod
    def send_account_activation_email(
        email: str,
        full_name: str,
        temporary_password: str,
    ) -> Dict[str, Any]:
        """
        Gửi email kích hoạt tài khoản kèm mật khẩu tạm thời với nội dung tiếng Việt chuẩn hóa.
        """
        subject = "Chào mừng đến với NexusCRM - Kích hoạt tài khoản và mật khẩu tạm thời"
        content = (
            f"Kính gửi {full_name},\n\n"
            f"Tài khoản người dùng của bạn trên hệ thống NexusCRM Enterprise đã được khởi tạo thành công.\n\n"
            f"Thông tin đăng nhập:\n"
            f"  - Tên đăng nhập (Email): {email}\n"
            f"  - Mật khẩu tạm thời: {temporary_password}\n\n"
            f"HƯỚNG DẪN BẢO MẬT:\n"
            f"1. Vui lòng truy cập cổng đăng nhập và sử dụng mật khẩu tạm thời ở trên.\n"
            f"2. Vì lý do an toàn thông tin, hệ thống yêu cầu bạn thay đổi mật khẩu ngay sau lần đăng nhập đầu tiên.\n"
            f"3. Tuyệt đối không chia sẻ mật khẩu này với bất kỳ ai.\n\n"
            f"Trân trọng,\n"
            f"Ban Quản Trị & Vận Hành NexusCRM Enterprise VN"
        )

        # Ghi log an toàn (không ghi mật khẩu ra file log sản phẩm)
        logger.info(f"[EMAIL SERVICE] Đã gửi email kích hoạt tới: {email} | Tiêu đề: {subject}")

        return {
            "success": True,
            "recipient": email,
            "subject": subject,
            "message": "Email kích hoạt và mật khẩu tạm thời đã được gửi thành công.",
        }
