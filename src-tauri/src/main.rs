#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, Manager};

fn main() {
  let tray_menu = SystemTrayMenu::new()
    .add_item(CustomMenuItem::new("battery", "Battery: 45% (Cortisol Red-Line)").disabled())
    .add_item(CustomMenuItem::new("action", "Next: Somatic Recovery Walk").disabled())
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(CustomMenuItem::new("toggle", "Open Dashboard"))
    .add_item(CustomMenuItem::new("quit", "Quit Ebb"));

  let system_tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick { position: _, size: _, .. } => {
        let window = app.get_window("main").unwrap();
        if window.is_visible().unwrap() {
          window.hide().unwrap();
        } else {
          window.show().unwrap();
          window.set_focus().unwrap();
        }
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "toggle" => {
            let window = app.get_window("main").unwrap();
            if window.is_visible().unwrap() {
              window.hide().unwrap();
            } else {
              window.show().unwrap();
              window.set_focus().unwrap();
            }
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
