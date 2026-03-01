//! 量化学习平台 Tauri 桌面应用入口
//!
//! Windows 桌面应用入口点，调用 lib.rs 中的 run() 启动。

// 隐藏 Windows 控制台窗口
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    quant_learn_desktop_lib::run()
}
