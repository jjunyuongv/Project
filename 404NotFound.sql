-------------------------------------------------------- 윤아
-- 일정관리 테이블
CREATE TABLE `EVENT`( 
 EVENT_ID INT NOT NULL AUTO_INCREMENT,
 CREW_EMPLOYEE_ID INT NOT NULL,
 TITLE VARCHAR(255) NOT NULL,
 CONTENT TEXT NULL,
 START_DATE DATE NOT NULL,
 END_DATE DATE NULL,
 CATEGORY VARCHAR(50) NOT NULL,
 PRIMARY KEY (EVENT_ID)
);

CREATE TABLE SHIFT_MEMOS( 
 MEMO_ID INT NOT NULL AUTO_INCREMENT,
 SHIFT_EMPLOYEE_ID INT NOT NULL,
 MEMO_DATE DATE NOT NULL,
 CONTENT TEXT NOT NULL,
 PRIMARY KEY (MEMO_ID)
 );

----------------------------------------------------- 준영
-- 전자결재 문서 테이블 
CREATE TABLE approval_doc(
 approval_doc_id VARCHAR(255) NOT NULL,
 approval_title VARCHAR(100) NOT NULL,
 approval_content VARCHAR(4000) NOT NULL,
 approval_date DATETIME NOT NULL,
 approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
 ofile VARCHAR(255),
 sfile VARCHAR(255),
 approval_author INT NOT NULL,
 approval_category ENUM('TIMEOFF','SHIFT','ETC') NOT NULL DEFAULT 'TIMEOFF',
 PRIMARY KEY (approval_doc_id)
);

-- 전자 결재 테이블
CREATE TABLE approval_line (
 approval_line_idx     INT NOT NULL AUTO_INCREMENT,
 approval_doc_id       VARCHAR(255) NOT NULL,
 approval_id           INT NOT NULL,
 approval_sequence     INT NOT NULL,
 approval_line_status  ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
 approval_line_date    DATETIME NULL,
 PRIMARY KEY (approval_line_idx)
);

-- 전자결재 카테고리 상세 테이블
CREATE TABLE timeoff_request(
 timeoff_id VARCHAR(255) NOT NULL,
 timeoff_type ENUM('ANNUAL','HALF','SICK') NOT NULL,
 timeoff_start DATE NOT NULL,
 timeoff_end DATE NOT NULL,
 timeoff_reason VARCHAR(1000),
 PRIMARY KEY (timeoff_id)
);

-- 채팅방 테이블
CREATE TABLE chat_room(
 chat_id INT NOT NULL AUTO_INCREMENT,
 chat_name VARCHAR(100) NOT NULL,
 chat_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 chat_type ENUM('DIRECT','GROUP') NOT NULL,
 chat_key VARCHAR(100) DEFAULT NULL, -- 중복 방지
 PRIMARY KEY (chat_id),
 UNIQUE KEY uk_chat_room_dmkey (chat_key) -- NULL 중복 허용(여러 Group방)
);

-- 채팅방 사용자 테이블
CREATE TABLE chat_users(
 chat_room_id INT NOT NULL,
 chat_user_id INT NOT NUll,
 PRIMARY KEY (chat_room_id, chat_user_id),
 KEY idx_chat_users_room (chat_room_id),
 KEY idx_chat_users_user (chat_user_id)
);

-- 채팅방 메시지 테이블
CREATE TABLE chat_message(
 message_id INT NOT NULL AUTO_INCREMENT,
 message_room_id INT NOT NULL,
 message_sender_id INT NOT NULL,
 message_content TEXT NOT NULL,
 message_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (message_id),
 KEY idx_msg_room_time (message_room_id, message_time),
 KEY idx_msg_sender (message_sender_id)
);


----------------------------------------------------- 혜원
-- 문서 보관소 테이블
DROP TABLE IF EXISTS archive;

CREATE TABLE archive(
 arch_id INT AUTO_INCREMENT,
 arch_title VARCHAR(500) NOT NULL,
 arch_ctnt VARCHAR(4000) NOT NULL,
 udt_dt DATETIME,
 udt_user_id INT ,
 reg_dt DATETIME NOT NULL,
 reg_user_id INT NOT NULL,
 PRIMARY KEY (arch_id) 
);

CREATE TABLE archive_files (
  file_id INT NOT NULL AUTO_INCREMENT,     -- 파일 고유 ID
  arch_id INT NOT NULL,                    -- 문서 ID (archive 테이블 FK)
  ofile   VARCHAR(255) NOT NULL,           -- 원본 파일명
  sfile   VARCHAR(255) NOT NULL,           -- 저장 파일명
  PRIMARY KEY (FILE_ID)
);

------------------------------------------------------ 현석
-- 사원 테이블
CREATE TABLE employees (
    employee_id INT NOT NULL,
    employee_loginid VARCHAR(50) NOT NULL UNIQUE,
    employee_name VARCHAR(50) NOT NULL,
    employee_email VARCHAR(100) NOT NULL UNIQUE,
    employee_address VARCHAR(255),
    employee_phone VARCHAR(20),
    employee_pw VARCHAR(255) NOT NULL,
    employee_create_date DATETIME NOT NULL,
    employee_role VARCHAR(20) DEFAULT 'USER',
    employee_department VARCHAR(50),
    employee_job VARCHAR(50),
    PRIMARY KEY (employee_id)
); 

-- -------------------------------------------------------- 현준
-- 시설물 정보 테이블
CREATE TABLE `facilities` (
  `facility_id` int NOT NULL AUTO_INCREMENT,
  `facility_name` varchar(255) NOT NULL,
  `facility_type` varchar(100) NOT NULL,
  `facility_location` varchar(255) NOT NULL,
  `facility_status` varchar(20) NOT NULL,
  `facility_manager_id` int DEFAULT NULL,
  PRIMARY KEY (`facility_id`)
);

CREATE TABLE `facility_reservations` (
  `reservation_id` int NOT NULL AUTO_INCREMENT,
  `reservation_facility_id` int NOT NULL,
  `reservation_employee_id` int NOT NULL,
  `reservation_status` varchar(20) NOT NULL,
  `reservation_start_time` datetime NOT NULL,
  `reservation_end_time` datetime NOT NULL,
  `reservation_date` datetime NOT NULL,
  PRIMARY KEY (`reservation_id`)
);

-- -----------------------------------------------------------------------------------------------------
-- 전자 결재 더미
USE `404notfound`;
-- =========================
-- 1) 전자결재 문서 11건
-- =========================
INSERT INTO approval_doc
(approval_doc_id, approval_title, approval_content, approval_date, approval_status, ofile, sfile, approval_author, approval_category)
VALUES
-- 1 APPROVED / TIMEOFF
('AP-2025-0001',
 '하계 연차 신청(김유진)',
 '여름 휴가 사용 신청드립니다.\n기간: ○○월 ○○일 ~ ○○월 ○○일\n업무 인수인계 완료했습니다.',
 NOW() - INTERVAL 1 DAY + INTERVAL 9 HOUR, 'APPROVED',
 '연차신청서_김유진.pdf', 'A1B2C3_2025_01.pdf', 1003, 'TIMEOFF'),

-- 2 PENDING / SHIFT
('AP-2025-0002',
 '야간 근무 교대 요청(7/12)',
 '개인 사정으로 7/12 야간 근무를 7/14 야간과 교대 요청드립니다.\n대상자: 1008',
 NOW() - INTERVAL 2 DAY + INTERVAL 10 HOUR, 'PENDING',
 NULL, NULL, 1005, 'SHIFT'),

-- 3 REJECTED / ETC
('AP-2025-0003',
 '장비 점검 비용 승인 요청(UPS 배터리 교체)',
 'UPS 배터리 교체 견적서 첨부합니다.\n금액: 1,280,000원(부가세 별도)\n교체 필요 사유: 수명 만료',
 NOW() - INTERVAL 3 DAY + INTERVAL 11 HOUR, 'REJECTED',
 '견적서_UPS.pdf', 'UPS_QO_2409.pdf', 1010, 'ETC'),

-- 4 PENDING / TIMEOFF (SICK)
('AP-2025-0004',
 '병가 신청(이서연)',
 '감기 증상으로 2일 병가 신청드립니다.\n진단서는 귀가 후 업로드 예정입니다.',
 NOW() - INTERVAL 1 DAY + INTERVAL 14 HOUR, 'PENDING',
 NULL, NULL, 1007, 'TIMEOFF'),

-- 5 APPROVED / ETC
('AP-2025-0005',
 '정비 지원 인력 파견 요청(현장 A-3)',
 '현장 A-3 긴급 장애 대응을 위해 정비 2인 파견 요청드립니다.\n기간: 금일 14:00~18:00',
 NOW() - INTERVAL 4 DAY + INTERVAL 9 HOUR, 'APPROVED',
 NULL, NULL, 1002, 'ETC'),

-- 6 APPROVED / SHIFT
('AP-2025-0006',
 '주간 근무 교대 조정(운영1팀)',
 '운영1팀 주간 근무 스케줄 조정안입니다.\n변경 대상: 1011 ↔ 1009',
 NOW() - INTERVAL 5 DAY + INTERVAL 9 HOUR, 'APPROVED',
 '교대표.xlsx', 'SFT_SWAP_01.xlsx', 1006, 'SHIFT'),

-- 7 REJECTED / TIMEOFF (HALF)
('AP-2025-0007',
 '반차 신청(오전, 김민수)',
 '오전 병원 진료로 반차 사용 신청합니다.',
 NOW() - INTERVAL 2 DAY + INTERVAL 8 HOUR, 'REJECTED',
 NULL, NULL, 1004, 'TIMEOFF'),

-- 8 PENDING / ETC
('AP-2025-0008',
 '비상발령 대응 계획 결재',
 '태풍 북상에 따른 비상 대응 계획서 결재 요청드립니다.\n주요 내용: 비상연락망, 대체근무, 복구절차',
 NOW() - INTERVAL 0 DAY + INTERVAL 9 HOUR, 'PENDING',
 '대응계획서_v1.1.pdf', 'EMG_PLAN_1_1.pdf', 1001, 'ETC'),

-- 9 APPROVED / TIMEOFF (ANNUAL)
('AP-2025-0009',
 '연차 사용 신청(가족 행사)',
 '가족 행사로 연차 1일 사용 신청합니다.',
 NOW() - INTERVAL 6 DAY + INTERVAL 10 HOUR, 'APPROVED',
 NULL, NULL, 1009, 'TIMEOFF'),

-- 10 APPROVED / ETC
('AP-2025-0010',
 '서버실 출입 권한 추가 요청(보안팀 협조)',
 '신규 프로젝트 투입으로 서버실 임시 출입 권한 2주간 요청드립니다.',
 NOW() - INTERVAL 3 DAY + INTERVAL 15 HOUR, 'APPROVED',
 NULL, NULL, 1011, 'ETC'),

-- 11 REJECTED / SHIFT
('AP-2025-0011',
 '주말 특근 승인 요청(데이터 마이그레이션)',
 '마이그레이션 작업 일정상 주말 특근 승인을 요청드립니다.\n일시: 토 09:00~18:00',
 NOW() - INTERVAL 7 DAY + INTERVAL 9 HOUR, 'REJECTED',
 NULL, NULL, 1008, 'SHIFT');

-- =========================
-- 2) 결재선(결재자 사번은 예시)
--    규칙:
--    - APPROVED: 전 라인 APPROVED + 시간 기록
--    - REJECTED: 1번 APPROVED, 2번 REJECTED
--    - PENDING : 1번 PENDING (2번은 옵션)
-- =========================

-- AP-2025-0001 (APPROVED) : 2명 승인
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0001', 2001, 1, 'APPROVED', NOW() - INTERVAL 1 DAY + INTERVAL 10 HOUR),
('AP-2025-0001', 3001, 2, 'APPROVED', NOW() - INTERVAL 1 DAY + INTERVAL 12 HOUR);

-- AP-2025-0002 (PENDING) : 1번 대기
INSERT INTO approval_line VALUES
(NULL, 'AP-2025-0002', 2005, 1, 'PENDING', NULL);

-- AP-2025-0003 (REJECTED) : 1 승인, 2 반려
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0003', 2003, 1, 'APPROVED', NOW() - INTERVAL 3 DAY + INTERVAL 12 HOUR),
('AP-2025-0003', 3003, 2, 'REJECTED', NOW() - INTERVAL 3 DAY + INTERVAL 14 HOUR);

-- AP-2025-0004 (PENDING) : 1번 대기
INSERT INTO approval_line VALUES
(NULL, 'AP-2025-0004', 2007, 1, 'PENDING', NULL);

-- AP-2025-0005 (APPROVED) : 1명 승인
INSERT INTO approval_line VALUES
(NULL, 'AP-2025-0005', 2002, 1, 'APPROVED', NOW() - INTERVAL 4 DAY + INTERVAL 10 HOUR);

-- AP-2025-0006 (APPROVED) : 2명 승인
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0006', 2006, 1, 'APPROVED', NOW() - INTERVAL 5 DAY + INTERVAL 10 HOUR),
('AP-2025-0006', 3006, 2, 'APPROVED', NOW() - INTERVAL 5 DAY + INTERVAL 12 HOUR);

-- AP-2025-0007 (REJECTED) : 1 승인, 2 반려
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0007', 2004, 1, 'APPROVED', NOW() - INTERVAL 2 DAY + INTERVAL 9 HOUR),
('AP-2025-0007', 3004, 2, 'REJECTED', NOW() - INTERVAL 2 DAY + INTERVAL 11 HOUR);

-- AP-2025-0008 (PENDING) : 1번 대기
INSERT INTO approval_line VALUES
(NULL, 'AP-2025-0008', 2001, 1, 'PENDING', NULL);

-- AP-2025-0009 (APPROVED) : 1명 승인
INSERT INTO approval_line VALUES
(NULL, 'AP-2025-0009', 2009, 1, 'APPROVED', NOW() - INTERVAL 6 DAY + INTERVAL 11 HOUR);

-- AP-2025-0010 (APPROVED) : 2명 승인
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0010', 2011, 1, 'APPROVED', NOW() - INTERVAL 3 DAY + INTERVAL 16 HOUR),
('AP-2025-0010', 3011, 2, 'APPROVED', NOW() - INTERVAL 3 DAY + INTERVAL 18 HOUR);

-- AP-2025-0011 (REJECTED) : 1 승인, 2 반려
INSERT INTO approval_line(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date) VALUES
('AP-2025-0011', 2008, 1, 'APPROVED', NOW() - INTERVAL 7 DAY + INTERVAL 10 HOUR),
('AP-2025-0011', 3008, 2, 'REJECTED', NOW() - INTERVAL 7 DAY + INTERVAL 12 HOUR);

-- =========================
-- 3) 휴가 상세 (TIMEOFF 문서만)
-- =========================
INSERT INTO timeoff_request(timeoff_id, timeoff_type, timeoff_start, timeoff_end, timeoff_reason) VALUES
('AP-2025-0001', 'ANNUAL', DATE(NOW()) + INTERVAL 7 DAY,  DATE(NOW()) + INTERVAL 10 DAY, '하계 휴가(국내 여행)'),
('AP-2025-0004', 'SICK',   DATE(NOW()) + INTERVAL 1 DAY,  DATE(NOW()) + INTERVAL 2 DAY,  '감기 증상으로 휴식 필요'),
('AP-2025-0007', 'HALF',   DATE(NOW()) + INTERVAL 0 DAY,  DATE(NOW()) + INTERVAL 0 DAY,  '오전 병원 진료'),
('AP-2025-0009', 'ANNUAL', DATE(NOW()) + INTERVAL 3 DAY,  DATE(NOW()) + INTERVAL 3 DAY,  '가족 행사(결혼식 참여)');