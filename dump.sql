-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: 404notfound
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `404notfound`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `404notfound` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `404notfound`;

--
-- Table structure for table `approval_doc`
--

DROP TABLE IF EXISTS `approval_doc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_doc` (
  `approval_doc_id` varchar(255) NOT NULL,
  `approval_title` varchar(100) NOT NULL,
  `approval_content` varchar(4000) NOT NULL,
  `approval_date` datetime NOT NULL,
  `approval_status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `ofile` varchar(255) DEFAULT NULL,
  `sfile` varchar(255) DEFAULT NULL,
  `approval_author` int NOT NULL,
  `approval_category` enum('TIMEOFF','SHIFT','ETC') NOT NULL DEFAULT 'TIMEOFF',
  PRIMARY KEY (`approval_doc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_doc`
--

LOCK TABLES `approval_doc` WRITE;
/*!40000 ALTER TABLE `approval_doc` DISABLE KEYS */;
INSERT INTO `approval_doc` VALUES ('AP-2025-076313','5555555555555555','123','2025-09-22 12:51:16','PENDING',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-227505','헤헤헤윤아바보','123123','2025-09-23 00:00:28','APPROVED','스크린샷 2025-05-28 173959.png','AP-2025-227505_1758553227505.png',20250014,'TIMEOFF'),('AP-2025-261127','444444444444','123','2025-09-22 12:04:21','REJECTED','스크린샷 2025-05-28 173959.png','AP-2025-261127_1758510282499.png',20250001,'ETC'),('AP-2025-278718','4','4','2025-09-23 19:44:39','PENDING',NULL,NULL,20250001,'ETC'),('AP-2025-280725','넉넉히1분','444444444444444444','2025-09-22 18:44:41','APPROVED','스크린샷 2025-05-28 163605.png','AP-2025-280725_1758534280727.png',20250001,'TIMEOFF'),('AP-2025-397083','휴가 변경','123123123','2025-09-22 14:53:17','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-438938','안녕','444444444','2025-09-22 14:53:59','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-472630','휴가','123123','2025-09-22 14:21:13','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-666009','테스트','수정','2025-09-20 22:41:06','REJECTED',NULL,NULL,20250001,'ETC'),('AP-2025-715697','변경','44444444444444','2025-09-22 14:41:56','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-759839','업로드','업로드','2025-09-20 22:42:40','PENDING','스크린샷 2025-05-28 163605.png','AP-2025-759839_1758375759839.png',20250001,'ETC'),('AP-2025-804494','아픔','아픔','2025-09-19 18:06:44','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-804869','변경','123123','2025-09-22 14:43:25','APPROVED',NULL,NULL,20250001,'TIMEOFF'),('AP-2025-874546','바보현준맞아요','44444','2025-09-22 23:37:55','PENDING','스크린샷 2025-09-16 165106.png','AP-2025-874546_1758551973366.png',20250014,'ETC'),('AP-2025-929540','123123','123','2025-09-21 00:58:50','REJECTED','스크린샷 2025-05-28 173959.png','AP-2025-929540_1758386445853.png',20250001,'ETC'),('AP-2025-957575','바보','141234','2025-09-22 15:35:58','PENDING',NULL,NULL,20250001,'TIMEOFF'),('APP-20250917-0301','기타: 문서보관소 권한 추가 요청','사유: 규정/매뉴얼 열람 권한 필요(Archive-Read).','2025-09-17 11:10:00','APPROVED',NULL,NULL,20250001,'ETC'),('APP-20250918-0201','근무 변경 (야간→주간)','사유: 교육 참석.\n변경: 22:00~07:00 → 09:00~18:00 (2025-09-23)','2025-09-18 15:20:00','PENDING',NULL,NULL,20250004,'SHIFT'),('APP-20250918-0202','근무 변경 (주간→야간)','사유: 팀 요청.\n변경: 09:00~18:00 → 14:00~23:00 (2025-09-24)','2025-09-18 16:10:00','REJECTED',NULL,NULL,20250004,'SHIFT'),('APP-20250919-0101','연차 신청 (2025-09-25)','사유: 개인 용무.\n기간: 2025-09-25 (하루)','2025-09-19 10:05:00','PENDING',NULL,NULL,20250001,'TIMEOFF'),('APP-20250919-0102','반차 신청 (2025-09-22 오전)','사유: 병원 진료.\n기간: 2025-09-22 09:00~13:00','2025-09-19 09:40:00','APPROVED','휴가신청서.pdf','20250919_0940_x1.pdf',20250001,'TIMEOFF');
/*!40000 ALTER TABLE `approval_doc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_line`
--

DROP TABLE IF EXISTS `approval_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_line` (
  `approval_line_idx` int NOT NULL AUTO_INCREMENT,
  `approval_doc_id` varchar(255) NOT NULL,
  `approval_id` int NOT NULL,
  `approval_sequence` int NOT NULL,
  `approval_line_status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `approval_line_date` datetime DEFAULT NULL,
  PRIMARY KEY (`approval_line_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_line`
--

LOCK TABLES `approval_line` WRITE;
/*!40000 ALTER TABLE `approval_line` DISABLE KEYS */;
INSERT INTO `approval_line` VALUES (1,'APP-20250919-0101',20250002,1,'PENDING',NULL),(2,'APP-20250919-0102',20250002,1,'APPROVED','2025-09-19 10:15:00'),(3,'APP-20250918-0201',20250002,1,'APPROVED','2025-09-18 15:40:00'),(4,'APP-20250918-0201',20250007,2,'PENDING',NULL),(5,'APP-20250918-0202',20250002,1,'APPROVED','2025-09-18 16:30:00'),(6,'APP-20250918-0202',20250010,2,'REJECTED','2025-09-18 17:00:00'),(7,'APP-20250917-0301',20250002,1,'APPROVED','2025-09-17 11:30:00'),(8,'APP-20250917-0301',20250007,2,'APPROVED','2025-09-17 12:00:00'),(9,'APP-20250917-0301',20250010,3,'APPROVED','2025-09-17 12:30:00'),(10,'AP-2025-804494',20250002,1,'APPROVED','2025-09-19 18:17:11'),(11,'AP-2025-666009',20250002,1,'REJECTED','2025-09-20 22:43:24'),(12,'AP-2025-759839',9001,1,'PENDING',NULL),(13,'AP-2025-929540',20250002,1,'REJECTED','2025-09-21 01:46:30'),(14,'AP-2025-261127',20250002,1,'REJECTED','2025-09-22 12:05:01'),(15,'AP-2025-076313',9001,1,'PENDING',NULL),(16,'AP-2025-472630',20250002,1,'APPROVED','2025-09-22 14:21:25'),(17,'AP-2025-715697',20250002,1,'APPROVED','2025-09-22 14:42:08'),(18,'AP-2025-804869',20250002,1,'APPROVED','2025-09-22 14:43:45'),(19,'AP-2025-397083',20250002,1,'APPROVED','2025-09-22 14:54:51'),(20,'AP-2025-438938',20250002,1,'APPROVED','2025-09-22 14:54:38'),(21,'AP-2025-957575',9001,1,'PENDING',NULL),(22,'AP-2025-280725',20250002,1,'APPROVED','2025-09-22 18:45:09'),(23,'AP-2025-874546',9001,1,'PENDING',NULL),(24,'AP-2025-227505',20250002,1,'APPROVED','2025-09-23 00:00:51'),(25,'AP-2025-278718',9001,1,'PENDING',NULL);
/*!40000 ALTER TABLE `approval_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archive`
--

DROP TABLE IF EXISTS `archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive` (
  `arch_id` int NOT NULL AUTO_INCREMENT,
  `arch_title` varchar(500) NOT NULL,
  `arch_ctnt` varchar(4000) NOT NULL,
  `udt_dt` datetime DEFAULT NULL,
  `udt_user_id` int DEFAULT NULL,
  `reg_dt` datetime NOT NULL,
  `reg_user_id` int NOT NULL,
  PRIMARY KEY (`arch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1014 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archive`
--

LOCK TABLES `archive` WRITE;
/*!40000 ALTER TABLE `archive` DISABLE KEYS */;
INSERT INTO `archive` VALUES (2,'헤헤헤헤헤나는바보','나는 바보현준이에요','2025-09-22 23:31:31',20250014,'2025-09-22 23:30:05',20250014),(3,'123','123',NULL,NULL,'2025-09-22 23:30:30',20250014),(4,'123123','124444',NULL,NULL,'2025-09-22 23:33:09',20250014),(5,'123','123123',NULL,NULL,'2025-09-22 23:36:46',20250014),(6,'나는바보현준헤헤','멍청이죠',NULL,NULL,'2025-09-22 23:37:30',20250014),(1001,'승무원 운항 규정집 v3.1','개정 요약: 이륙/접근 최소고도 업데이트, 기상 악화 시 대체공항 선택 기준 강화. 적용 대상: 전 승무원. 세부 규정은 첨부 PDF 참조.','2025-09-10 10:05:00',9001,'2025-07-01 09:00:00',9001),(1002,'지상조업 안전 매뉴얼(램프/게이트)','유도봉 사용, 마샬링 수신호, 푸시백 구역 반경 통제 기준, 활주로·유도로 인접지역 접근 제한 절차 포함.',NULL,NULL,'2025-07-03 14:20:00',9012),(1003,'응급의료 키트(EMK) 사용 가이드','기내 의료상황 분류(의식/호흡/출혈), AED 사용 단계, 보고 체계(기장-관제-지상 의료대응) 요약.','2025-08-22 16:40:00',9020,'2025-07-05 08:45:00',9020),(1004,'정비 작업 표준절차(SOP) – A320 계열','라인정비/야간 정비 체크리스트 업데이트. 토크값 표준, 체결 표기법, 공구 관리대장 샘플 포함.',NULL,NULL,'2025-07-06 11:10:00',9007),(1005,'보안 검색 매뉴얼 v2','승객·휴대물품·수하물 보안검색 흐름과 제한물품 목록 최신화. 의심물품 보고 단계 상세.','2025-09-01 09:12:00',9011,'2025-07-08 09:12:00',9011),(1006,'항공기 제빙/방빙 절차(De/Anti-Icing)','Type I/IV 액 적용 조건, OAT/Precipitation 별 혼합비 및 Holdover Time(참고표) 수록.',NULL,NULL,'2025-07-09 07:50:00',9003),(1007,'피로도 관리(FFM) 정책','승무원 스케줄 배정 시 최소 휴식시간, 교대 기준, 자기 보고(피로) 승인-보류-대체 배정 프로세스.','2025-08-30 18:05:00',9001,'2025-07-10 15:32:00',9001),(1008,'비상 대응(이머전시) 체크리스트','연기/화재, 급강하, 우발 승객, 응급의료, 연료비상 등 상황별 즉응 체크리스트 카드 템플릿.',NULL,NULL,'2025-07-12 10:00:00',9015),(1009,'건강검진/자격 갱신 일정표(승무/정비/운항)','직군별 정기검진 주기 및 자격증 갱신 기한 정리. 만료 60/30/7일 자동 알림 권장.','2025-09-11 13:20:00',9022,'2025-07-13 13:20:00',9022),(1010,'시설 예약 정책(회의실/브리핑룸/시뮬레이터)','예약 단위, 취소/노쇼 페널티, 승인 권한, 사용 후 점검 체크리스트(청결·장비상태) 포함.',NULL,NULL,'2025-07-14 09:05:00',9005),(1011,'근태관리 사용자 가이드(사내 그룹웨어)','출퇴근 체크, 근무유형 변경 신청, 월별 통계 확인, 관리자 승인/반려 흐름을 스크린샷과 함께 설명.','2025-08-05 17:00:00',9002,'2025-07-15 12:10:00',9002),(1012,'문서 보관 규정 및 권한 체계','보존연한(영구/10년/5년/1년), 열람 권한(Role 기반), 이력관리(작성/개정/소유자) 표준.',NULL,NULL,'2025-07-16 08:30:00',9001),(1013,'hi','gd',NULL,NULL,'2025-09-23 14:34:20',20250001);
/*!40000 ALTER TABLE `archive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archive_files`
--

DROP TABLE IF EXISTS `archive_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive_files` (
  `file_id` int NOT NULL AUTO_INCREMENT,
  `arch_id` int NOT NULL,
  `ofile` varchar(255) NOT NULL,
  `sfile` varchar(255) NOT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archive_files`
--

LOCK TABLES `archive_files` WRITE;
/*!40000 ALTER TABLE `archive_files` DISABLE KEYS */;
INSERT INTO `archive_files` VALUES (5,2,'스크린샷 2025-05-28 174114.png','192ac4d3-9668-4ff4-a4d0-c80688f33ba4.png');
/*!40000 ALTER TABLE `archive_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `attendance_id` bigint NOT NULL AUTO_INCREMENT,
  `attendance_employee_id` int NOT NULL,
  `attendance_date` date NOT NULL,
  `attendance_start` time DEFAULT NULL,
  `attendance_end` time DEFAULT NULL,
  `attendance_status` varchar(100) NOT NULL,
  `attendance_reason` varchar(255) DEFAULT NULL,
  `attendance_edit_employee_id` int DEFAULT NULL,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `uq_attendance` (`attendance_date`,`attendance_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendars`
--

DROP TABLE IF EXISTS `calendars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendars` (
  `shift_id` varchar(255) NOT NULL,
  `all_day` varchar(255) NOT NULL,
  `day_type` varchar(255) NOT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `team_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendars`
--

LOCK TABLES `calendars` WRITE;
/*!40000 ALTER TABLE `calendars` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_message`
--

DROP TABLE IF EXISTS `chat_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_message` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `message_room_id` int NOT NULL,
  `message_sender_id` int NOT NULL,
  `message_content` text NOT NULL,
  `message_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `idx_msg_room_time` (`message_room_id`,`message_time`),
  KEY `idx_msg_sender` (`message_sender_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_message`
--

LOCK TABLES `chat_message` WRITE;
/*!40000 ALTER TABLE `chat_message` DISABLE KEYS */;
INSERT INTO `chat_message` VALUES (1,1,20250001,'ㅎㅇ','2025-09-21 02:23:50'),(2,1,20250001,'안녕?','2025-09-21 02:24:22'),(3,3,20250001,'ㅎㅇ','2025-09-22 09:41:47'),(4,3,20250002,'ㅎㅇ','2025-09-22 12:05:14');
/*!40000 ALTER TABLE `chat_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_room`
--

DROP TABLE IF EXISTS `chat_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_room` (
  `chat_id` int NOT NULL AUTO_INCREMENT,
  `chat_name` varchar(100) NOT NULL,
  `chat_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `chat_type` enum('DIRECT','GROUP') NOT NULL,
  `chat_key` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`chat_id`),
  UNIQUE KEY `uk_chat_room_dmkey` (`chat_key`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_room`
--

LOCK TABLES `chat_room` WRITE;
/*!40000 ALTER TABLE `chat_room` DISABLE KEYS */;
INSERT INTO `chat_room` VALUES (1,'DM 2025002-20250001','2025-09-21 02:23:47','DIRECT','2025002#20250001'),(2,'DM 20250002-20250003','2025-09-21 02:48:06','DIRECT','20250002#20250003'),(3,'DM 20250001-20250002','2025-09-22 09:41:44','DIRECT','20250001#20250002');
/*!40000 ALTER TABLE `chat_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_users`
--

DROP TABLE IF EXISTS `chat_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_users` (
  `chat_room_id` int NOT NULL,
  `chat_user_id` int NOT NULL,
  PRIMARY KEY (`chat_room_id`,`chat_user_id`),
  KEY `idx_chat_users_room` (`chat_room_id`),
  KEY `idx_chat_users_user` (`chat_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_users`
--

LOCK TABLES `chat_users` WRITE;
/*!40000 ALTER TABLE `chat_users` DISABLE KEYS */;
INSERT INTO `chat_users` VALUES (1,2025002),(2,20250002),(2,20250003),(3,20250001),(3,20250002);
/*!40000 ALTER TABLE `chat_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `employee_loginid` varchar(50) NOT NULL,
  `employee_name` varchar(50) NOT NULL,
  `employee_gender` varchar(10) DEFAULT NULL,
  `employee_email` varchar(100) NOT NULL,
  `employee_address` varchar(255) DEFAULT NULL,
  `employee_phone` varchar(20) DEFAULT NULL,
  `employee_pw` varchar(255) NOT NULL,
  `employee_create_date` datetime NOT NULL,
  `employee_role` varchar(20) DEFAULT 'USER',
  `employee_department` varchar(50) DEFAULT NULL,
  `employee_job` varchar(50) DEFAULT NULL,
  `employee_kakao_id` varchar(255) DEFAULT NULL,
  `employee_google_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_loginid` (`employee_loginid`),
  UNIQUE KEY `employee_email` (`employee_email`),
  UNIQUE KEY `employee_kakao_id` (`employee_kakao_id`),
  UNIQUE KEY `employee_google_id` (`employee_google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20250017 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (20250001,'jy','준영','남자','jjunyuongv@gmail.com','경기 성남시 분당구 판교역로 6','01011112222','$2a$10$X5tszRm0kuo6PWMF0ZsH2u4vZ9wTCgNnvDcRgli5vrlWHYue1FNiG','2025-09-18 18:03:52','USER','','',NULL,NULL),(20250002,'매니저','매니저','남자','iamstudybox00@gmail.com','경기 성남시 분당구 판교역로 6','01011112222','$2a$10$CDYTpmRzbOUPrE0wL3VsVeEmdXthCyWvfUNpqX5gepdU7.KZYCeEe','2025-09-19 12:39:24','MANAGER','운항','기장',NULL,NULL),(20250003,'capt_lee','이도현','남자','capt.lee@airgroup.local','서울 강서구 하늘대로 1','01050000001','$2a$10$z/fs1.dnaMXx6ZswzqRTx.x1eJJuirI66KmVzG.RSM7rGvjBVr552','2025-09-19 15:03:30','MANAGER','운항','기장',NULL,NULL),(20250004,'fo_kim','김서준','남자','fo.kim@airgroup.local','인천 중구 공항대로 2','01050000002','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','운항','부기장',NULL,NULL),(20250005,'atc_park','박하늘','여자','atc.park@airgroup.local','서울 영등포구 대림로 3','01050000003','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','운항','항공교통관제사',NULL,NULL),(20250006,'disp_choi','최수연','여자','disp.choi@airgroup.local','서울 마포구 성지길 4','01050000004','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','운항','운항관리사',NULL,NULL),(20250007,'purser_jung','정민아','여자','purser.jung@airgroup.local','서울 서대문구 연세로 8-1','01050000005','$2a$10$z/fs1.dnaMXx6ZswzqRTx.x1eJJuirI66KmVzG.RSM7rGvjBVr552','2025-09-19 15:03:30','MANAGER','객실서비스','사무장',NULL,NULL),(20250008,'fa_han','한지우','여자','fa.han@airgroup.local','서울 강남구 테헤란로 5','01050000006','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','객실서비스','승무원',NULL,NULL),(20250009,'fa_yoo','유나래','여자','fa.yoo@airgroup.local','서울 종로구 종로 6','01050000007','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','객실서비스','승무원',NULL,NULL),(20250010,'gm_song','송재현','남자','gm.song@airgroup.local','인천 서구 청라한울로 7','01050000008','$2a$10$z/fs1.dnaMXx6ZswzqRTx.x1eJJuirI66KmVzG.RSM7rGvjBVr552','2025-09-19 15:03:30','MANAGER','지상직원','지상 관리자',NULL,NULL),(20250011,'baggage_oh','오세린','여자','bag.oh@airgroup.local','인천 중구 공항동로 8','01050000009','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','지상직원','수하물 관리사',NULL,NULL),(20250012,'mx_kwon','권도윤','남자','mx.kwon@airgroup.local','경기 김포시 공항로 9','01050000010','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','지상직원','항공기 정비사',NULL,NULL),(20250013,'sec_lim','임채현','남자','sec.lim@airgroup.local','서울 은평구 통일로 10','01050000011','$2a$10$6MBFK3vD77X745fjN9ykveuRKUmEIOGZ4hGR1go1yHUPszH8c6qTu','2025-09-19 15:03:30','USER','지상직원','보안 검색 요원',NULL,NULL),(20250014,'kakao_4459905402','JY',NULL,'noemail@example.com',NULL,NULL,'','2025-09-22 18:33:18','USER',NULL,NULL,'4459905402',NULL),(20250015,'google_108487141217486215593','김현석',NULL,'dajub09@gmail.com',NULL,NULL,'','2025-09-22 18:40:09','USER',NULL,NULL,NULL,'108487141217486215593'),(20250016,'google_104817224509631302378','장준영',NULL,'noemail2@example.com',NULL,NULL,'','2025-09-23 12:56:41','USER',NULL,NULL,NULL,'104817224509631302378');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `EVENT_ID` int NOT NULL AUTO_INCREMENT,
  `CREW_EMPLOYEE_ID` int NOT NULL,
  `TITLE` varchar(255) NOT NULL,
  `CONTENT` text,
  `START_DATE` date NOT NULL,
  `END_DATE` date DEFAULT NULL,
  `CATEGORY` varchar(50) NOT NULL,
  PRIMARY KEY (`EVENT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (2,1,'ㄴㄴ','ㄴㄴ','2025-09-24','2025-09-24','비행일정'),(3,1,'ㄴㄴ','ㄴㄴ','2025-09-25','2025-09-25','정비일정'),(4,1,'ㄴㄴ','ㄴㄴ','2025-09-26','2025-09-26','교육일정'),(5,1,'ㄴㄴ','ㄴㄴ','2025-09-23','2025-09-23','휴가일정'),(7,1,'123123','123','2025-09-15','2025-09-15','정비일정'),(9,20250001,'[휴가] 123','44444444444444\n(유형:ANNUAL, 기간:2025-09-01~2025-09-02)\n[SRC:APPROVAL:AP-2025-715697]','2025-09-01','2025-09-02','휴가일정'),(10,20250001,'[휴가] 4444444','123123\n(유형:HALF, 기간:2025-09-04~2025-09-05)\n[SRC:APPROVAL:AP-2025-804869]','2025-09-04','2025-09-05','휴가일정'),(11,20250001,'4444','123123','2025-09-07','2025-09-07','개인일정'),(12,20250001,'[휴가] 문서작성','444444444\n(유형:SICK, 기간:2025-09-12~2025-09-13)\n[SRC:APPROVAL:AP-2025-438938]','2025-09-12','2025-09-13','휴가일정'),(14,20250001,'[휴가] 123123','444444444444444444\n(유형:ANNUAL, 기간:2025-09-14~2025-09-15)\n[SRC:APPROVAL:AP-2025-280725]','2025-09-14','2025-09-15','휴가일정'),(15,20250014,'[휴가] 123','123123\n(유형:ANNUAL, 기간:2025-09-30~2025-10-01)\n[SRC:APPROVAL:AP-2025-227505]','2025-09-30','2025-10-01','휴가일정'),(16,20250002,'4444444444444','444','2025-09-27','2025-09-27','교육일정'),(17,20250002,'오','징어','2025-09-03','2025-09-03','개인일정');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `facility_id` int NOT NULL AUTO_INCREMENT,
  `facility_name` varchar(255) NOT NULL,
  `facility_type` varchar(100) NOT NULL,
  `facility_location` varchar(255) NOT NULL,
  `facility_status` varchar(20) NOT NULL,
  `facility_manager_id` int DEFAULT NULL,
  PRIMARY KEY (`facility_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (2,'현준','회의실','','사용가능',20250001),(4,'123123','주차장','서울 구로구 구일로 52','사용가능',20250001);
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility_reservations`
--

DROP TABLE IF EXISTS `facility_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility_reservations` (
  `reservation_id` int NOT NULL AUTO_INCREMENT,
  `reservation_facility_id` int NOT NULL,
  `reservation_employee_id` int NOT NULL,
  `reservation_status` varchar(20) NOT NULL,
  `reservation_start_time` datetime NOT NULL,
  `reservation_end_time` datetime NOT NULL,
  `reservation_date` datetime NOT NULL,
  PRIMARY KEY (`reservation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility_reservations`
--

LOCK TABLES `facility_reservations` WRITE;
/*!40000 ALTER TABLE `facility_reservations` DISABLE KEYS */;
INSERT INTO `facility_reservations` VALUES (1,2,20250002,'승인','2025-09-24 09:30:00','2025-09-25 01:42:00','2025-09-23 00:41:21');
/*!40000 ALTER TABLE `facility_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift_memos`
--

DROP TABLE IF EXISTS `shift_memos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shift_memos` (
  `MEMO_ID` int NOT NULL AUTO_INCREMENT,
  `SHIFT_EMPLOYEE_ID` int NOT NULL,
  `MEMO_DATE` date NOT NULL,
  `TEAM_NAME` varchar(20) NOT NULL DEFAULT 'A조',
  `CONTENT` text NOT NULL,
  PRIMARY KEY (`MEMO_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift_memos`
--

LOCK TABLES `shift_memos` WRITE;
/*!40000 ALTER TABLE `shift_memos` DISABLE KEYS */;
INSERT INTO `shift_memos` VALUES (2,1,'2025-09-10','B조','ㅇ'),(3,1,'2025-09-16','B조','123'),(4,1,'2025-09-14','B조','132');
/*!40000 ALTER TABLE `shift_memos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeoff_request`
--

DROP TABLE IF EXISTS `timeoff_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeoff_request` (
  `timeoff_id` varchar(255) NOT NULL,
  `timeoff_type` enum('ANNUAL','HALF','SICK') NOT NULL,
  `timeoff_start` date NOT NULL,
  `timeoff_end` date NOT NULL,
  `timeoff_reason` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`timeoff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeoff_request`
--

LOCK TABLES `timeoff_request` WRITE;
/*!40000 ALTER TABLE `timeoff_request` DISABLE KEYS */;
INSERT INTO `timeoff_request` VALUES ('AP-2025-0001','ANNUAL','2025-09-15','2025-09-18','하계 휴가(국내 여행)'),('AP-2025-0004','SICK','2025-09-09','2025-09-10','감기 증상으로 휴식 필요'),('AP-2025-0007','HALF','2025-09-08','2025-09-08','오전 병원 진료'),('AP-2025-0009','ANNUAL','2025-09-11','2025-09-11','가족 행사(결혼식 참여)'),('AP-2025-076313','ANNUAL','2025-09-23','2025-09-23','123'),('AP-2025-089458','ANNUAL','2025-09-09','2025-09-10','123123'),('AP-2025-120665','HALF','2025-09-25','2025-09-25','4444'),('AP-2025-219434','SICK','2025-09-30','2025-10-01','123'),('AP-2025-227505','ANNUAL','2025-09-30','2025-10-01','123'),('AP-2025-280725','ANNUAL','2025-09-14','2025-09-15','123123'),('AP-2025-344604','ANNUAL','2025-09-18','2025-09-20','44444444'),('AP-2025-346595','SICK','2025-09-18','2025-09-19',''),('AP-2025-397083','ANNUAL','2025-09-22','2025-09-23','123'),('AP-2025-438938','SICK','2025-09-12','2025-09-13',''),('AP-2025-472630','ANNUAL','2025-09-22','2025-09-23','123'),('AP-2025-540443','ANNUAL','2025-09-20','2025-09-21','111'),('AP-2025-715697','ANNUAL','2025-09-01','2025-09-02','123'),('AP-2025-804494','SICK','2025-09-30','2025-10-01','ㅠㅠ'),('AP-2025-804869','HALF','2025-09-04','2025-09-05','4444444'),('AP-2025-846848','SICK','2025-09-16','2025-09-17','123'),('AP-2025-875752','HALF','2025-09-20','2025-09-20','123123'),('AP-2025-957575','ANNUAL','2025-09-19','2025-09-20',''),('AP-2025-965105','SICK','2025-09-22','2025-09-22','');
/*!40000 ALTER TABLE `timeoff_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database '404notfound'
--

--
-- Dumping routines for database '404notfound'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-24 16:38:23
