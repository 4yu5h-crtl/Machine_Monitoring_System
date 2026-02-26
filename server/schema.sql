
CREATE DATABASE IF NOT EXISTS paperless_skf;
USE paperless_skf;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  token_no VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  full_name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machine_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_no VARCHAR(255) NOT NULL,
    channel_no VARCHAR(50),
    shift VARCHAR(20),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    ndt_or_status VARCHAR(50),
    ndt_ir_status VARCHAR(50),
    mma_status VARCHAR(50),
    abg_status VARCHAR(50),
    xhf_cone_ht_status VARCHAR(50),
    mvr_status VARCHAR(50),
    missing_roller_status VARCHAR(50),
    ir_width_status VARCHAR(50),
    or_width_status VARCHAR(50),
    outer_diameter_mib_status VARCHAR(50),
    double_cage_hit_status VARCHAR(50),
    ball_missing_myd_status VARCHAR(50),
    rivet_missing_myd_status VARCHAR(50),
    break_myd_status VARCHAR(50),
    clearance_mgi_status VARCHAR(50),
    shield_check_status VARCHAR(50),

    ndt_or_remark TEXT,
    ndt_ir_remark TEXT,
    mma_remark TEXT,
    abg_remark TEXT,
    xhf_cone_ht_remark TEXT,
    mvr_remark TEXT,
    missing_roller_remark TEXT,
    ir_width_remark TEXT,
    or_width_remark TEXT,
    outer_diameter_mib_remark TEXT,
    double_cage_hit_remark TEXT,
    ball_missing_myd_remark TEXT,
    rivet_missing_myd_remark TEXT,
    break_myd_remark TEXT,
    clearance_mgi_remark TEXT,
    shield_check_remark TEXT,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
