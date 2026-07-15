//! USR/CoreFab — Constitutional Runtime CLI
//! USR/CoreFab v0.1.0
//!
//! Usage:
//!   corefab version          — Show runtime version
//!   corefab capabilities     — List runtime capabilities
//!   corefab validate <file>  — Validate a blueprint
//!   corefab execute <file>   — Execute a blueprint
//!   corefab verify           — Verify runtime consistency

use std::env;
use std::fs;
use corefab::runtime::UsrRuntime;

fn main() {
    let args: Vec<String> = env::args().collect();
    let command = args.get(1).map(|s| s.as_str()).unwrap_or("help");

    match command {
        "version" => {
            let runtime = UsrRuntime::new();
            println!("USR/CoreFab v{}", runtime.version());
            println!("ICore Constitutional Runtime");
        }

        "capabilities" => {
            let runtime = UsrRuntime::new();
            println!("USR/CoreFab v{} Capabilities:", runtime.version());
            for cap in runtime.capabilities() {
                println!("  • {}", cap);
            }
        }

        "validate" => {
            let file = args.get(2).expect("Usage: corefab validate <blueprint.json>");
            let content = fs::read_to_string(file).expect("Cannot read file");
            let runtime = UsrRuntime::new();

            match runtime.validate_blueprint(&content) {
                Ok(true) => println!("✅ Blueprint is constitutionally valid"),
                Ok(false) => println!("❌ Blueprint validation returned false"),
                Err(e) => println!("❌ Blueprint invalid: {}", e),
            }
        }

        "execute" => {
            let file = args.get(2).expect("Usage: corefab execute <blueprint.json>");
            let content = fs::read_to_string(file).expect("Cannot read file");
            let mut runtime = UsrRuntime::new();

            match runtime.execute_blueprint(&content) {
                Ok(result) => println!("{}", result),
                Err(e) => {
                    eprintln!("❌ Execution failed: {}", e);
                    std::process::exit(1);
                }
            }
        }

        "verify" => {
            let runtime = UsrRuntime::new();
            match runtime.verify() {
                Ok(true) => println!("✅ Runtime is constitutionally consistent"),
                Ok(false) => println!("❌ Runtime verification returned false"),
                Err(e) => println!("❌ Runtime verification failed: {}", e),
            }
        }

        "help" | _ => {
            println!("USR/CoreFab — Constitutional Runtime");
            println!("Version: 0.1.0");
            println!();
            println!("Usage:");
            println!("  corefab version          Show runtime version");
            println!("  corefab capabilities     List runtime capabilities");
            println!("  corefab validate <file>  Validate a blueprint");
            println!("  corefab execute <file>   Execute a blueprint");
            println!("  corefab verify           Verify runtime consistency");
        }
    }
}
