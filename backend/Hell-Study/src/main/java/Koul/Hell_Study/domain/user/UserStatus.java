package Koul.Hell_Study.domain.user;

public enum UserStatus {
    PENDING,    // 회원가입 신청 후 승인 대기
    APPROVED,   // Admin 승인 완료
    REJECTED    // Admin 승인 거절
}
