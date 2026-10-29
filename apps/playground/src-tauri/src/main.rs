// Stops a console window from opening next to the app in Windows release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    xbo_playground_lib::run()
}
