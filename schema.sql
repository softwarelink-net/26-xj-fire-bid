-- 1. 用户与安保值班人员表 (Users)
CREATE TABLE IF NOT EXISTS xjfire_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,          -- 保卫处监控中心, 消防保卫科, 巡更机动队
    role TEXT NOT NULL CHECK(role IN ('ROLE_SUPER_ADMIN', 'ROLE_SECURITY_DISPATCHER', 'ROLE_PATROL_GUARD', 'ROLE_DECISION_MAKER')),
    phone TEXT,
    badge_no TEXT,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 系统全局配置与 Feature Flags (System Configs)
CREATE TABLE IF NOT EXISTS xjfire_system_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 五大系统物联网设备资产表 (IoT Device Assets)
CREATE TABLE IF NOT EXISTS xjfire_devices (
    id TEXT PRIMARY KEY,
    device_code TEXT NOT NULL UNIQUE,  -- 如 DEV-CCTV-MZ-01, DEV-SMOKE-ZY-05
    device_name TEXT NOT NULL,
    system_type TEXT NOT NULL CHECK(system_type IN ('VIDEO_SURVEILLANCE', 'FIRE_PROTECTION', 'EMERGENCY_ALARM', 'ACCESS_CONTROL', 'ELECTRONIC_PATROL')),
    building_zone TEXT NOT NULL,       -- 门诊楼, 住院部A座, 急救中心, 医技综合楼, 高压氧舱
    floor_room TEXT NOT NULL,          -- 1F 大厅, 3F ICU, 5F 手术室, 7F 护士站
    ip_address TEXT,
    status TEXT DEFAULT 'ONLINE' CHECK(status IN ('ONLINE', 'ALARMING', 'FAULT', 'OFFLINE')),
    last_metric_value REAL,            -- 水压 (MPa), 烟雾浓度 (ppm), 温度 (℃)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 实时警情与多系统联动事件表 (Security & Fire Alarms)
CREATE TABLE IF NOT EXISTS xjfire_alarms (
    id TEXT PRIMARY KEY,
    alarm_no TEXT NOT NULL UNIQUE,
    system_type TEXT NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    building_zone TEXT NOT NULL,
    floor_room TEXT NOT NULL,
    alarm_type TEXT NOT NULL CHECK(alarm_type IN ('FIRE_SMOKE', 'HYDRANT_LOW_PRESSURE', 'SOS_HELP', 'INTRUSION_ALERT', 'DOOR_FORCED_OPEN', 'PASSAGE_BLOCKED')),
    severity TEXT NOT NULL CHECK(severity IN ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY')),
    linkage_action_executed TEXT,      -- 联动动作：如 [球机切至预置位03] + [门禁强切释放] + [广播启动]
    snapshot_url TEXT,
    handler_id TEXT,
    handler_name TEXT,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PROCESSING', 'VERIFIED_CLOSED', 'FALSE_ALARM')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY(device_id) REFERENCES xjfire_devices(id)
);

-- 5. 电子巡更任务与打卡轨迹表 (Patrol Tasks & Logs)
CREATE TABLE IF NOT EXISTS xjfire_patrol_logs (
    id TEXT PRIMARY KEY,
    task_no TEXT NOT NULL,
    guard_id TEXT NOT NULL,
    guard_name TEXT NOT NULL,
    route_name TEXT NOT NULL,          -- 夜间门诊消防动火巡更线, ICU及手术室重点巡查线
    checkpoint_name TEXT NOT NULL,
    checkpoint_rfid TEXT NOT NULL,
    plan_time DATETIME NOT NULL,
    actual_time DATETIME,
    check_status TEXT DEFAULT 'NORMAL' CHECK(check_status IN ('NORMAL', 'DEFECT_FOUND', 'MISSED', 'TIMEOUT')),
    defect_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 信创安全审计日志表 (Security Audit Logs)
CREATE TABLE IF NOT EXISTS xjfire_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT,
    action_name TEXT NOT NULL,
    ip_address TEXT,
    request_uri TEXT,
    request_method TEXT,
    status_code INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 种子数据初始化 (Seed Data)
-- ==============================================================================

-- 注入演示用户
INSERT OR REPLACE INTO xjfire_users (id, username, password_hash, full_name, department, role, phone, badge_no) VALUES
('u-01', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '系统超级管理员', '保卫处监控中心', 'ROLE_SUPER_ADMIN', '0991-4362391', 'XJ-ADMIN-01'),
('u-02', 'dispatcher', 'e10adc3949ba59abbe56e057f20f883e', '买合木提·艾力', '消防保卫监控中心', 'ROLE_SECURITY_DISPATCHER', '0991-4362392', 'XJ-DISP-08'),
('u-03', 'guard', 'e10adc3949ba59abbe56e057f20f883e', '张建安', '保卫处巡更机动队', 'ROLE_PATROL_GUARD', '13909918801', 'XJ-GUARD-22'),
('u-04', 'leader', 'e10adc3949ba59abbe56e057f20f883e', '李副院长', '新疆医科大学第一附属医院院领导', 'ROLE_DECISION_MAKER', '0991-4362300', 'XJ-LEAD-01');

-- 注入 Feature Flags 与全局配置
INSERT OR REPLACE INTO xjfire_system_configs (config_key, config_value, category, description) VALUES
('FEATURE_AUTO_CROSS_LINKAGE', 'true', 'FEATURE_FLAG', '是否开启火警/求助触发视频预置位抓拍与门禁强切联动'),
('FEATURE_SM4_DATA_MASKING', 'true', 'SECURITY', '是否启用医护人员手机号及值班门禁刷卡信息国密 SM4 动态脱敏'),
('EMERGENCY_RESPONSE_SLA_SECONDS', '60', 'SLA', '急诊一键求助安保人员到达现场标准响应时限（秒）');

-- 注入五大系统物联网设备资产
INSERT OR REPLACE INTO xjfire_devices (id, device_code, device_name, system_type, building_zone, floor_room, ip_address, status, last_metric_value) VALUES
('dev-01', 'DEV-FIRE-MZ-01', '门诊大厅智能烟感探测器01', 'FIRE_PROTECTION', '门诊楼', '1F 大厅中庭', '10.20.10.11', 'ONLINE', 12.0),
('dev-02', 'DEV-CCTV-MZ-02', '门诊挂号大厅高清全景球机', 'VIDEO_SURVEILLANCE', '门诊楼', '1F 挂号收费处', '10.20.10.22', 'ONLINE', NULL),
('dev-03', 'DEV-SOS-JZ-03', '急诊抢救室一键紧急求助按钮', 'EMERGENCY_ALARM', '急救中心', '1F 抢救室01', '10.20.20.31', 'ONLINE', NULL),
('dev-04', 'DEV-DOOR-ICU-04', '重症医学科(ICU)防尾随双向门禁', 'ACCESS_CONTROL', '住院部A座', '3F ICU主入口', '10.20.30.41', 'ONLINE', NULL),
('dev-05', 'DEV-WATER-ZY-05', '住院部消火栓末端试水压力传感器', 'FIRE_PROTECTION', '住院部A座', '12F 消防通道', '10.20.30.55', 'ONLINE', 0.28),
('dev-06', 'DEV-RFID-YG-06', '高压氧舱防爆巡更打卡点', 'ELECTRONIC_PATROL', '医技综合楼', 'B1F 氧舱机房', NULL, 'ONLINE', NULL);

-- 注入警情联动事件样本
INSERT OR REPLACE INTO xjfire_alarms (id, alarm_no, system_type, device_id, device_name, building_zone, floor_room, alarm_type, severity, linkage_action_executed, snapshot_url, handler_name, status) VALUES
('alm-01', 'ALM20260814-001', 'FIRE_PROTECTION', 'dev-01', '门诊大厅智能烟感探测器01', '门诊楼', '1F 大厅中庭', 'FIRE_SMOKE', 'CRITICAL', '【联动执行】球机 DEV-CCTV-MZ-02 调至预置位01抓拍 + 门禁 DEV-DOOR-ICU-04 释放 + 广播切入疏散模式', 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/fire_mz_01.jpg', '买合木提·艾力', 'PROCESSING'),
('alm-02', 'ALM20260814-002', 'EMERGENCY_ALARM', 'dev-03', '急诊抢救室一键紧急求助按钮', '急救中心', '1F 抢救室01', 'SOS_HELP', 'EMERGENCY', '【联动执行】安防大屏声光弹窗 + 推送就近巡逻人员（张建安）1分钟内赶赴现场', 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/sos_jz_02.jpg', '张建安', 'VERIFIED_CLOSED');

-- 注入电子巡更记录
INSERT OR REPLACE INTO xjfire_patrol_logs (id, task_no, guard_id, guard_name, route_name, checkpoint_name, checkpoint_rfid, plan_time, actual_time, check_status) VALUES
('ptl-01', 'TSK-2026081401', 'u-03', '张建安', '夜间重点区域消防巡查线', '医技综合楼B1F氧舱机房', 'RFID-YNOU-B1-01', '2026-08-14 02:00:00', '2026-08-14 02:04:15', 'NORMAL'),
('ptl-02', 'TSK-2026081401', 'u-03', '张建安', '夜间重点区域消防巡查线', '住院部12F消火栓末端试水点', 'RFID-YNOU-12F-08', '2026-08-14 02:30:00', '2026-08-14 02:32:10', 'NORMAL');

-- 扩展演示资产（五大子系统矩阵）
INSERT OR REPLACE INTO xjfire_devices (id, device_code, device_name, system_type, building_zone, floor_room, ip_address, status, last_metric_value) VALUES
('dev-07', 'DEV-CCTV-ZY-07', '住院部A座3F ICU走廊球机', 'VIDEO_SURVEILLANCE', '住院部A座', '3F ICU走廊', '10.20.30.22', 'ONLINE', NULL),
('dev-08', 'DEV-CCTV-JZ-08', '急救中心救护车通道枪机', 'VIDEO_SURVEILLANCE', '急救中心', '1F 救护车通道', '10.20.20.22', 'ALARMING', NULL),
('dev-09', 'DEV-ELEC-MZ-09', '门诊电气火灾剩余电流监测', 'FIRE_PROTECTION', '门诊楼', 'B1F 配电间', '10.20.10.61', 'ONLINE', 186.0),
('dev-10', 'DEV-LEAK-YG-10', '高压氧舱水浸探测器', 'FIRE_PROTECTION', '高压氧舱', 'B1F 机房地沟', '10.20.40.12', 'FAULT', 0.0),
('dev-11', 'DEV-SOS-NS-11', '住院部7F护士站一键求助', 'EMERGENCY_ALARM', '住院部A座', '7F 护士站', '10.20.30.71', 'ONLINE', NULL),
('dev-12', 'DEV-DOOR-DMP-12', '毒麻药品库双人双锁门禁', 'ACCESS_CONTROL', '医技综合楼', '2F 药库', '10.20.40.41', 'ONLINE', NULL),
('dev-13', 'DEV-DOOR-OR-13', '手术室限制区通道闸', 'ACCESS_CONTROL', '住院部A座', '5F 手术室', '10.20.30.51', 'ONLINE', NULL),
('dev-14', 'DEV-RFID-MZ-14', '门诊大厅夜间动火巡更点', 'ELECTRONIC_PATROL', '门诊楼', '1F 大厅中庭', NULL, 'ONLINE', NULL),
('dev-15', 'DEV-RFID-OR-15', '手术室消防通道巡更点', 'ELECTRONIC_PATROL', '住院部A座', '5F 手术室消防通道', NULL, 'ONLINE', NULL);

INSERT OR REPLACE INTO xjfire_alarms (id, alarm_no, system_type, device_id, device_name, building_zone, floor_room, alarm_type, severity, linkage_action_executed, snapshot_url, handler_name, status) VALUES
('alm-03', 'ALM20260818-003', 'FIRE_PROTECTION', 'dev-05', '住院部消火栓末端试水压力传感器', '住院部A座', '12F 消防通道', 'HYDRANT_LOW_PRESSURE', 'WARNING', '【联动执行】推送消防保卫科复核水压 + 球机 DEV-CCTV-ZY-07 预置位抓拍', 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/hydrant_12f.jpg', NULL, 'PENDING'),
('alm-04', 'ALM20260818-004', 'ACCESS_CONTROL', 'dev-12', '毒麻药品库双人双锁门禁', '医技综合楼', '2F 药库', 'DOOR_FORCED_OPEN', 'CRITICAL', '【联动执行】防尾随复核 + 邻近球机轮巡 + 值班长弹窗', 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/door_dmp.jpg', NULL, 'PENDING'),
('alm-05', 'ALM20260818-005', 'ELECTRONIC_PATROL', 'dev-15', '手术室消防通道巡更点', '住院部A座', '5F 手术室消防通道', 'PASSAGE_BLOCKED', 'WARNING', '【联动执行】AI 通道占用抓拍工单 + 隐患 SLA 黄牌', 'https://26-xj-fire-bid-assets.softwarelink.net/snapshots/passage_or.jpg', '张建安', 'PROCESSING');

INSERT OR REPLACE INTO xjfire_patrol_logs (id, task_no, guard_id, guard_name, route_name, checkpoint_name, checkpoint_rfid, plan_time, actual_time, check_status, defect_description) VALUES
('ptl-03', 'TSK-2026081801', 'u-03', '张建安', 'ICU及手术室重点巡查线', '住院部A座5F手术室消防通道', 'RFID-YNOU-5F-OR', '2026-08-18 14:00:00', '2026-08-18 14:06:40', 'DEFECT_FOUND', '消防通道堆放医用推车，通道净宽不足，已拍照上报隐患工单'),
('ptl-04', 'TSK-2026081801', 'u-03', '张建安', 'ICU及手术室重点巡查线', '住院部A座3F ICU主入口', 'RFID-YNOU-3F-ICU', '2026-08-18 14:20:00', NULL, 'TIMEOUT', NULL),
('ptl-05', 'TSK-2026081802', 'u-03', '张建安', '夜间门诊消防动火巡更线', '门诊楼B1F配电间', 'RFID-YNOU-MZ-B1', '2026-08-18 02:10:00', NULL, 'MISSED', NULL);
