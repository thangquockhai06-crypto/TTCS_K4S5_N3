"""
Database Seeder Script for NexusCRM
Run this script to seed default admin account and sample data:
python seed.py
"""
import sys
import os

# Thêm thư mục hiện tại vào sys.path để import được app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.customer import Customer
from app.models.deal import Deal
from app.core.security import hash_password

def seed_database():
    print("[1/3] Đang kiểm tra cấu trúc bảng trong MySQL...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[2/3] Đang nạp tài khoản Quản trị viên (Super Admin)...")
        admin_email = "admin@nexuscrm.vn"
        admin = db.query(User).filter(User.email == admin_email).first()

        if not admin:
            admin = User(
                id="usr-admin-01",
                email=admin_email,
                password_hash=hash_password("Admin@2026"),
                full_name="Quản Trị Viên Hệ Thống",
                role="Super Admin",
                title="Quản trị viên cấp cao (System Admin)",
                department="Ban Quản Trị & Vận Hành Doanh Thu",
                workspace_name="NexusCRM Enterprise VN",
                avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=QuanTriVien",
                failed_attempts=0,
                lockout_until=None,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("  -> Đã tạo tài khoản Admin: admin@nexuscrm.vn | Mật khẩu: Admin@2026")
        else:
            print("  -> Tài khoản Admin đã tồn tại sẵn.")

        print("[3/3] Đang nạp dữ liệu mẫu khách hàng & cơ hội bán hàng (Deals)...")
        if db.query(Customer).count() == 0:
            sample_customers = [
                Customer(
                    id="cust-01",
                    full_name="Nguyễn Văn An",
                    email="an.nguyen@vinacorp.vn",
                    phone="0912345678",
                    company="Tập Đoàn VinaCorp",
                    status="active",
                    health_score=92,
                    assigned_user_id=admin.id,
                    avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=NguyenVanAn",
                ),
                Customer(
                    id="cust-02",
                    full_name="Trần Thị Bích",
                    email="bich.tran@techglobal.vn",
                    phone="0987654321",
                    company="TechGlobal Solutions",
                    status="lead",
                    health_score=85,
                    assigned_user_id=admin.id,
                    avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=TranThiBich",
                ),
                Customer(
                    id="cust-03",
                    full_name="Lê Hoàng Cường",
                    email="cuong.le@vietlogistics.com",
                    phone="0903112233",
                    company="VietLogistics Express",
                    status="prospect",
                    health_score=78,
                    assigned_user_id=admin.id,
                    avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=LeHoangCuong",
                ),
            ]
            db.add_all(sample_customers)
            db.commit()

            sample_deals = [
                Deal(
                    id="deal-01",
                    title="Gói CRM Enterprise 50 Người dùng",
                    value=150000000.0,
                    stage="negotiation",
                    probability=80,
                    customer_id="cust-01",
                    owner_id=admin.id,
                ),
                Deal(
                    id="deal-02",
                    title="Tích hợp Tổng đài VoIP Doanh nghiệp",
                    value=45000000.0,
                    stage="proposal",
                    probability=60,
                    customer_id="cust-02",
                    owner_id=admin.id,
                ),
                Deal(
                    id="deal-03",
                    title="Phần mềm Quản lý Kho vận & Vận tải",
                    value=80000000.0,
                    stage="lead",
                    probability=30,
                    customer_id="cust-03",
                    owner_id=admin.id,
                ),
            ]
            db.add_all(sample_deals)
            db.commit()
            print("  -> Đã nạp thành công 3 khách hàng & 3 cơ hội bán hàng mẫu.")
        else:
            print("  -> Dữ liệu khách hàng đã có sẵn.")

        print("\n=======================================================")
        print(" THÀNH CÔNG: Cơ sở dữ liệu nexuscrm_db đã sẵn sàng! ")
        print(" Tài khoản test:")
        print("   - Email: admin@nexuscrm.vn")
        print("   - Mật khẩu: Admin@2026")
        print("=======================================================")

    except Exception as e:
        print(f"\n[LỖI NẠP DỮ LIỆU]: {e}")
        print("Vui lòng kiểm tra file .env xem mật khẩu MySQL đã đúng chưa và MySQL Workbench đang chạy.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
