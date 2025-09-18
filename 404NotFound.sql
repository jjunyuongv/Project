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
drop table employees;
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

select * from employees;
delete from employees where employee_name = "준영";
