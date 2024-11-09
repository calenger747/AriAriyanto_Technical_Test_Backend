/*
 Navicat Premium Data Transfer

 Source Server         : Localhost PHP 7.2
 Source Server Type    : MySQL
 Source Server Version : 80030
 Source Host           : 127.0.0.1:3306
 Source Schema         : leads_management

 Target Server Type    : MySQL
 Target Server Version : 80030
 File Encoding         : 65001

 Date: 09/11/2024 21:06:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for accounts
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NULL DEFAULT NULL,
  `client_id` int NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lead_id`(`lead_id`) USING BTREE,
  INDEX `client_id`(`client_id`) USING BTREE,
  CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of accounts
-- ----------------------------

-- ----------------------------
-- Table structure for final_proposals
-- ----------------------------
DROP TABLE IF EXISTS `final_proposals`;
CREATE TABLE `final_proposals`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NOT NULL,
  `details` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lead_id`(`lead_id`) USING BTREE,
  CONSTRAINT `final_proposals_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of final_proposals
-- ----------------------------
INSERT INTO `final_proposals` VALUES (1, 72, 'Offering best price of $10,000 with a 12-month service plan.', '2024-11-09 12:29:19');

-- ----------------------------
-- Table structure for leads
-- ----------------------------
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `status` enum('Leads Baru','Follow Up','Survey Request','Survey Approved by Operational','Survey Rejected by Operational','Survey Completed','Follow Up (Final Proposal)','Deal') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT 'Leads Baru',
  `salesperson_id` int NULL DEFAULT NULL,
  `type` enum('Residential','Commercial') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `client_id` int NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `salesperson_id`(`salesperson_id`) USING BTREE,
  INDEX `client_fk1`(`client_id`) USING BTREE,
  CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`salesperson_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `client_fk1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 72 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of leads
-- ----------------------------
INSERT INTO `leads` VALUES (70, 'John Doe', '1234567890', 'john.doe@example.com', 'Leads Baru', 3, 'Residential', NULL, '2024-11-08 21:43:52', '2024-11-08 21:43:52');
INSERT INTO `leads` VALUES (71, 'John Doe', '1234567890', 'john.doe@example.com', 'Leads Baru', 7, 'Commercial', NULL, '2024-11-08 21:44:01', '2024-11-09 17:14:57');
INSERT INTO `leads` VALUES (72, 'John Doe', '1234567890', 'john.doe@example.com', 'Deal', 5, 'Commercial', 11, '2024-11-09 00:15:55', '2024-11-09 19:32:53');

-- ----------------------------
-- Table structure for leads_history
-- ----------------------------
DROP TABLE IF EXISTS `leads_history`;
CREATE TABLE `leads_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NULL DEFAULT NULL,
  `lead_status` enum('Leads Baru','Follow Up','Survey Request','Survey Approved by Operational','Survey Rejected by Operational','Survey Completed','Follow Up (Final Proposal)','Deal') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `comments` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lead_idfk`(`lead_id`) USING BTREE,
  CONSTRAINT `lead_idfk` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 50 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of leads_history
-- ----------------------------
INSERT INTO `leads_history` VALUES (25, 70, 'Leads Baru', 'New Leads Created', NULL);
INSERT INTO `leads_history` VALUES (26, 71, 'Leads Baru', 'New Leads Created', NULL);
INSERT INTO `leads_history` VALUES (27, 72, 'Leads Baru', 'New Leads Created', NULL);
INSERT INTO `leads_history` VALUES (29, 72, 'Follow Up', 'Silahkan di Follow Up', '2024-11-09 00:35:36');
INSERT INTO `leads_history` VALUES (35, 72, 'Survey Request', 'Status updated to Survey Request', '2024-11-09 01:07:32');
INSERT INTO `leads_history` VALUES (36, 72, 'Survey Request', 'Survey Request created', '2024-11-09 01:07:32');
INSERT INTO `leads_history` VALUES (37, 72, 'Survey Approved by Operational', 'Status updated to Survey Approved by Operational', '2024-11-09 08:39:35');
INSERT INTO `leads_history` VALUES (39, 72, 'Survey Completed', 'Status updated to Survey Completed', '2024-11-09 09:43:35');
INSERT INTO `leads_history` VALUES (41, 72, 'Follow Up (Final Proposal)', 'Salesperson created the final proposal for client approval.', '2024-11-09 12:29:19');
INSERT INTO `leads_history` VALUES (48, 72, 'Deal', 'Status updated to Deal', '2024-11-09 17:00:00');
INSERT INTO `leads_history` VALUES (49, 72, 'Deal', 'Client account created.', '2024-11-09 17:00:00');

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `key_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `key_value` int NULL DEFAULT NULL,
  PRIMARY KEY (`key_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES ('currentCommercialSalespersonIndex', 2);
INSERT INTO `settings` VALUES ('currentResidentialSalespersonIndex', 1);

-- ----------------------------
-- Table structure for survey
-- ----------------------------
DROP TABLE IF EXISTS `survey`;
CREATE TABLE `survey`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NULL DEFAULT NULL,
  `survey_request_date` date NULL DEFAULT NULL,
  `survey_date` date NULL DEFAULT NULL,
  `survey_image` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `notes` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL,
  `status` enum('Requested','Approved','Rejected','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT 'Requested',
  `operational_id` int NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lead_id`(`lead_id`) USING BTREE,
  INDEX `operational_id`(`operational_id`) USING BTREE,
  CONSTRAINT `survey_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `survey_ibfk_2` FOREIGN KEY (`operational_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of survey
-- ----------------------------

-- ----------------------------
-- Table structure for survey_history
-- ----------------------------
DROP TABLE IF EXISTS `survey_history`;
CREATE TABLE `survey_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `comments` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `surveyId_fk`(`survey_id`) USING BTREE,
  CONSTRAINT `surveyId_fk` FOREIGN KEY (`survey_id`) REFERENCES `survey_requests` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of survey_history
-- ----------------------------
INSERT INTO `survey_history` VALUES (2, 7, 'Survey Requested', 'Survey created', '2024-11-09 01:07:32');
INSERT INTO `survey_history` VALUES (3, 7, 'Survey Approved', 'Approve Survey Request', '2024-11-09 08:39:35');
INSERT INTO `survey_history` VALUES (5, 7, 'Survey Completed', 'Complete Survey Request', '2024-11-09 09:43:35');

-- ----------------------------
-- Table structure for survey_image
-- ----------------------------
DROP TABLE IF EXISTS `survey_image`;
CREATE TABLE `survey_image`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NULL DEFAULT NULL,
  `images` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `surveyIdImage_fk`(`survey_id`) USING BTREE,
  CONSTRAINT `surveyIdImage_fk` FOREIGN KEY (`survey_id`) REFERENCES `survey_requests` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of survey_image
-- ----------------------------
INSERT INTO `survey_image` VALUES (1, 7, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/UB4n9sAAAAASUVORK5CYII=', '2024-11-09 09:43:35');
INSERT INTO `survey_image` VALUES (2, 7, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/UB4n9sAAAAASUVORK5CYII=', '2024-11-09 09:43:35');

-- ----------------------------
-- Table structure for survey_requests
-- ----------------------------
DROP TABLE IF EXISTS `survey_requests`;
CREATE TABLE `survey_requests`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `client_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `survey_date` date NULL DEFAULT NULL,
  `status` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `notes` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `leadId_fk`(`lead_id`) USING BTREE,
  CONSTRAINT `leadId_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of survey_requests
-- ----------------------------
INSERT INTO `survey_requests` VALUES (7, 72, 'Jl. Mawar No. 1 Kebagusan', 'Ari Ariyanto', '2024-11-08', 'Survey Completed', 'lokasi sudah sesuai', '2024-11-09 01:07:32');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `role` enum('Super Admin','Customer Service','Salesperson','Operational','Client') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `residential_sales` tinyint(1) NULL DEFAULT 0,
  `commercial_sales` tinyint(1) NULL DEFAULT 0,
  `punishment_start` datetime(0) NULL DEFAULT NULL,
  `punishment_end` datetime(0) NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'Superadmin', 'superadmin@mail.com', '$2a$10$H7/0Ygk/INYZQc4QJib7juZeSWsLGw7tAH6NdT/Wh/.j5TPHc0PRW', 'Super Admin', 0, 0, NULL, NULL, '2024-11-06 23:00:36', '2024-11-09 18:21:10');
INSERT INTO `users` VALUES (2, 'Customer Service', 'customer_service@mail.com', '$2a$10$e7WkucmbIxBt.03l3ZO1luVVGXk53NLkANayBI5m0QvgzxVzWqtCG', 'Customer Service', 0, 0, NULL, NULL, '2024-11-06 23:02:01', '2024-11-09 18:21:25');
INSERT INTO `users` VALUES (3, 'Sales Person 1', 'salesperson1@mail.com', '$2a$10$rFXwgRDhW/0oLLfD/1alROhD.RN8fyFfo6R3../4j/CBAtdcnZZB6', 'Salesperson', 1, 1, '2024-11-09 09:14:57', '2024-11-16 09:14:57', '2024-11-06 23:02:42', '2024-11-09 18:21:37');
INSERT INTO `users` VALUES (4, 'Sales Person 2', 'salesperson2@mail.com', '$2a$10$yG6h8yOL9EqpaW3iEOhZyeLQRQN7zi5M0GgRb6J1UEcmCfhR7sJvq', 'Salesperson', 1, 0, NULL, NULL, '2024-11-06 23:03:16', '2024-11-09 18:21:49');
INSERT INTO `users` VALUES (5, 'Sales Person 3', 'salesperson3@mail.com', '$2a$10$xYh86ttAhwJoVo.3PpLjCuxwkOIdNAa5OQl4Y10eTDg8JvdTOc02S', 'Salesperson', 0, 1, NULL, NULL, '2024-11-06 23:05:36', '2024-11-09 18:22:06');
INSERT INTO `users` VALUES (6, 'Operational', 'operational@mail.com', '$2a$10$My8WJctN4lDSCfAktRsau.j27yetS4hrw2sJWf9eHqDW70gOSkGOi', 'Operational', 0, 0, NULL, NULL, '2024-11-06 23:06:13', '2024-11-09 18:22:17');
INSERT INTO `users` VALUES (7, 'Sales Person 4', 'salesperson4@mail.com', '$2a$10$hRCxfe3tO/WiOrNQpF4fK.69G4Y9hGTD7CCYTWb/EQRedehrXuKwy', 'Salesperson', 1, 1, NULL, NULL, '2024-11-07 22:49:06', '2024-11-09 18:22:28');
INSERT INTO `users` VALUES (8, 'Sales Person 5', 'salesperson5@mail.com', '$2a$10$h4H3RWixyBPXvzv/F0WDPeVbbV2EOHouaifXr2nZ11KB9ycWmVO0a', 'Salesperson', 1, 0, NULL, NULL, '2024-11-07 22:49:06', '2024-11-09 18:22:38');
INSERT INTO `users` VALUES (9, 'Sales Person 6', 'salesperson6@mail.com', '$2a$10$aBFJlrbG45LRFsa1DhWSb.Fa3zHJ.LEAUe/0LjqUrt2D7sNgJyf2a', 'Salesperson', 0, 1, NULL, NULL, '2024-11-07 22:49:06', '2024-11-09 18:22:48');
INSERT INTO `users` VALUES (11, 'John Doe', 'john.doe@example.com', '$2b$10$nD4h8VlNhthjNgm9UbPU3eQCK8GyMYNhNAzlTeYTN1joSQRaP/6G.', 'Client', 0, 0, NULL, NULL, '2024-11-09 17:00:00', '2024-11-09 17:00:00');
INSERT INTO `users` VALUES (12, 'Salesperson New', 'salesperson_new@mail.com', '$2b$10$QNFz9BZ6IJ0NEl2dYZpKL.VGVJ0b8.sOX7ECVpOO21mbmrzSMyzD2', 'Salesperson', 0, 1, NULL, NULL, '2024-11-09 18:38:53', '2024-11-09 18:38:53');
INSERT INTO `users` VALUES (13, 'Operational New', 'operational_new@mail.com', '$2b$10$XY99Zc15PzVgsN9FFEVRYutTpZFbUHVxANurDMjr3WSjvCj7mZQI2', 'Operational', 0, 0, NULL, NULL, '2024-11-09 18:40:32', '2024-11-09 18:40:32');

SET FOREIGN_KEY_CHECKS = 1;
