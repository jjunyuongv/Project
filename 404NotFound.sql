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
 
 CREATE TABLE calendars( 
 shift_id varchar(255) NOT NULL,
 all_day varchar(255) NOT NULL,
 day_type varchar(255) NOT NULL,
 end_time datetime(6) NULL,
 start_time datetime(6) NULL,
 team_name varchar(255),
 PRIMARY KEY (shift_id)
 );
 
 select * from `event`;
ALTER TABLE SHIFT_MEMOS
ADD COLUMN TEAM_NAME VARCHAR(20) NOT NULL DEFAULT 'A조' AFTER MEMO_DATE;
 
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
    employee_gender VARCHAR(10) NOT NULL, 
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
-- 근태관리
CREATE TABLE attendances (
    attendance_id BIGINT AUTO_INCREMENT,
    attendance_employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_start TIME,
    attendance_end TIME,
    attendance_status VARCHAR(100) NOT NULL,
    attendance_reason VARCHAR(255) NULL,
    attendance_edit_employee_id INT,
    PRIMARY KEY (attendance_id)
);
-- ------------------------------------------------------------------------------
-- 회원정보 더미
ALTER TABLE employees MODIFY employee_id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE employees AUTO_INCREMENT = 20250003;
-- 재사용할 비밀번호 해시(BCrypt $2a$)
SET @PW_USER    = '$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu'; -- Crew@2025
SET @PW_MANAGER = '$2a$10$z/fs1.dnaMXx6ZswzqRTx.x1eJJuirI66KmVzG.RSM7rGvjBVr552'; -- Admin1234!

INSERT INTO employees
  (employee_loginid, employee_name, employee_gender, employee_email, employee_address, employee_phone,
   employee_pw, employee_create_date, employee_role, employee_department, employee_job)
VALUES
  -- 운항
  ('capt_lee',      '이도현', '남자', 'capt.lee@airgroup.local', '서울 강서구 하늘대로 1',   '01050000001', @PW_MANAGER, NOW(), 'MANAGER', '운항',     '기장'),
  ('fo_kim',        '김서준', '남자', 'fo.kim@airgroup.local',    '인천 중구 공항대로 2',     '01050000002', @PW_USER,    NOW(), 'USER',    '운항',     '부기장'),
  ('atc_park',      '박하늘', '여자', 'atc.park@airgroup.local',  '서울 영등포구 대림로 3',   '01050000003', @PW_USER,    NOW(), 'USER',    '운항',     '항공교통관제사'),
  ('disp_choi',     '최수연', '여자', 'disp.choi@airgroup.local', '서울 마포구 성지길 4',     '01050000004', @PW_USER,    NOW(), 'USER',    '운항',     '운항관리사'),

  -- 객실서비스
  ('purser_jung',   '정민아', '여자', 'purser.jung@airgroup.local','서울 서대문구 연세로 8-1','01050000005', @PW_MANAGER, NOW(), 'MANAGER', '객실서비스','사무장'),
  ('fa_han',        '한지우', '여자', 'fa.han@airgroup.local',    '서울 강남구 테헤란로 5',   '01050000006', @PW_USER,    NOW(), 'USER',    '객실서비스','승무원'),
  ('fa_yoo',        '유나래', '여자', 'fa.yoo@airgroup.local',    '서울 종로구 종로 6',       '01050000007', @PW_USER,    NOW(), 'USER',    '객실서비스','승무원'),

  -- 지상직원
  ('gm_song',       '송재현', '남자', 'gm.song@airgroup.local',   '인천 서구 청라한울로 7',   '01050000008', @PW_MANAGER, NOW(), 'MANAGER', '지상직원', '지상 관리자'),
  ('baggage_oh',    '오세린', '여자', 'bag.oh@airgroup.local',    '인천 중구 공항동로 8',     '01050000009', @PW_USER,    NOW(), 'USER',    '지상직원', '수하물 관리사'),
  ('mx_kwon',       '권도윤', '남자', 'mx.kwon@airgroup.local',   '경기 김포시 공항로 9',     '01050000010', @PW_USER,    NOW(), 'USER',    '지상직원', '항공기 정비사'),
  ('sec_lim',       '임채현', '남자', 'sec.lim@airgroup.local',   '서울 은평구 통일로 10',    '01050000011', @PW_USER,    NOW(), 'USER',    '지상직원', '보안 검색 요원');

-- 전자 결재 더미
/* ============================================
	결재자/작성자 변수 세팅
   - 필수 결재자: 20250002
   - 추가 결재자: '객실서비스' 매니저, '지상직원' 매니저(없으면 다른 매니저 → 20250002)
   - 작성자: 일반 USER 2명(없으면 아무 사번 → 20250002)
============================================ */

SET @approver_ops := 20250002;

SET @approver_cabin := COALESCE(
  (SELECT employee_id FROM employees
   WHERE employee_role='MANAGER' AND employee_department='객실서비스' AND employee_id<>@approver_ops
   ORDER BY employee_id LIMIT 1),
  (SELECT employee_id FROM employees
   WHERE employee_role='MANAGER' AND employee_id<>@approver_ops
   ORDER BY employee_id LIMIT 1),
  @approver_ops
);

SET @approver_ground := COALESCE(
  (SELECT employee_id FROM employees
   WHERE employee_role='MANAGER' AND employee_department='지상직원' AND employee_id NOT IN (@approver_ops, @approver_cabin)
   ORDER BY employee_id LIMIT 1),
  (SELECT employee_id FROM employees
   WHERE employee_role='MANAGER' AND employee_id NOT IN (@approver_ops, @approver_cabin)
   ORDER BY employee_id LIMIT 1),
  @approver_ops
);

SET @author1 := COALESCE(
  (SELECT employee_id FROM employees WHERE employee_role='USER' ORDER BY employee_id LIMIT 1),
  (SELECT employee_id FROM employees WHERE employee_id<>@approver_ops ORDER BY employee_id LIMIT 1),
  @approver_ops
);

SET @author2 := COALESCE(
  (SELECT employee_id FROM employees WHERE employee_role='USER' AND employee_id<>@author1 ORDER BY employee_id LIMIT 1),
  (SELECT employee_id FROM employees WHERE employee_id<>@approver_ops ORDER BY employee_id LIMIT 1),
  @approver_ops
);

/* ============================================
	전자결재 문서 더미
   - 상태/카테고리 다양하게 구성
   - 문서ID: APP-YYYYMMDD-XXXX (충돌 방지용 다른 번호 사용)
============================================ */
INSERT INTO approval_doc
(approval_doc_id, approval_title, approval_content, approval_date,
 approval_status, ofile, sfile, approval_author, approval_category)
VALUES
  -- A1: 휴가 신청 (대기) - 단일 결재(20250002)
  ('APP-20250919-0101','연차 신청 (2025-09-25)',
   '사유: 개인 용무.\n기간: 2025-09-25 (하루)',
   '2025-09-19 10:05:00','PENDING',NULL,NULL,@author1,'TIMEOFF'),

  -- A2: 휴가 신청 (승인) - 단일 결재(20250002)
  ('APP-20250919-0102','반차 신청 (2025-09-22 오전)',
   '사유: 병원 진료.\n기간: 2025-09-22 09:00~13:00',
   '2025-09-19 09:40:00','APPROVED','휴가신청서.pdf','20250919_0940_x1.pdf',@author1,'TIMEOFF'),

  -- B1: 근무변경 (대기) - 2단계(20250002 → 객실 매니저)
  ('APP-20250918-0201','근무 변경 (야간→주간)',
   '사유: 교육 참석.\n변경: 22:00~07:00 → 09:00~18:00 (2025-09-23)',
   '2025-09-18 15:20:00','PENDING',NULL,NULL,@author2,'SHIFT'),

  -- B2: 근무변경 (반려) - 2단계(20250002 승인 → 지상 매니저 반려)
  ('APP-20250918-0202','근무 변경 (주간→야간)',
   '사유: 팀 요청.\n변경: 09:00~18:00 → 14:00~23:00 (2025-09-24)',
   '2025-09-18 16:10:00','REJECTED',NULL, NULL,@author2,'SHIFT'),

  -- C1: 기타 (승인) - 3단계(20250002 → 객실 매니저 → 지상 매니저)
  ('APP-20250917-0301','기타: 문서보관소 권한 추가 요청',
   '사유: 규정/매뉴얼 열람 권한 필요(Archive-Read).',
   '2025-09-17 11:10:00','APPROVED',NULL,NULL,@author1,'ETC');

/* ============================================
	결재선 더미
   - 문서 상태와 라인 상태 일치
============================================ */
INSERT INTO approval_line
(approval_doc_id, approval_id, approval_sequence, approval_line_status, approval_line_date)
VALUES
  -- A1: 단일 결재, 대기
  ('APP-20250919-0101', @approver_ops,   1, 'PENDING',  NULL),

  -- A2: 단일 결재, 승인
  ('APP-20250919-0102', @approver_ops,   1, 'APPROVED', '2025-09-19 10:15:00'),

  -- B1: 2단계 - 1승인, 2대기 → 문서 PENDING
  ('APP-20250918-0201', @approver_ops,   1, 'APPROVED', '2025-09-18 15:40:00'),
  ('APP-20250918-0201', @approver_cabin, 2, 'PENDING',  NULL),

  -- B2: 2단계 - 1승인, 2반려 → 문서 REJECTED
  ('APP-20250918-0202', @approver_ops,   1, 'APPROVED', '2025-09-18 16:30:00'),
  ('APP-20250918-0202', @approver_ground,2, 'REJECTED', '2025-09-18 17:00:00'),

  -- C1: 3단계 전부 승인 → 문서 APPROVED
  ('APP-20250917-0301', @approver_ops,   1, 'APPROVED', '2025-09-17 11:30:00'),
  ('APP-20250917-0301', @approver_cabin, 2, 'APPROVED', '2025-09-17 12:00:00'),
  ('APP-20250917-0301', @approver_ground,3, 'APPROVED', '2025-09-17 12:30:00');
select * from employees;
select * from approval_doc;
select * from `EVENT`;
