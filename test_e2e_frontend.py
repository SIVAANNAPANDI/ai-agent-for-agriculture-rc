import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def run_tests():
    print("=" * 60)
    print("🚀 STARTING AUTOMATED END-TO-END FRONTEND TEST SUITE")
    print("=" * 60)
    
    os.makedirs("frontend_test_results", exist_ok=True)
    
    routes = [
        ("/", "HomePage"),
        ("/login", "LoginPage"),
        ("/signup", "SignupPage"),
        ("/farm", "FarmPage"),
        ("/recommendations", "CropRecommendationPage"),
        ("/calendar", "CultivationCalendarPage"),
        ("/ai-agent", "AIAgentPage"),
        ("/disease", "LeafDiseaseScannerPage"),
        ("/market", "ProduceMarketPage"),
        ("/labours", "FarmLabourPage"),
        ("/rentals", "FarmlandRentalsPage"),
        ("/notifications", "NotificationsPage"),
        ("/settings", "SettingsPage"),
    ]
    
    results = []
    
    async with async_playwright() as p:
        # Try msedge first, fallback to chrome
        browser = None
        for channel in ["msedge", "chrome"]:
            try:
                print(f"Attempting to launch browser with channel '{channel}'...")
                browser = await p.chromium.launch(channel=channel, headless=True)
                print(f" Successfully launched {channel}!")
                break
            except Exception as e:
                print(f" Could not launch {channel}: {e}")
        
        if not browser:
            print("❌ No browser could be launched.")
            sys.exit(1)
            
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        # Track console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        base_url = "http://localhost:5173"
        
        for route, name in routes:
            url = f"{base_url}{route}"
            print(f"\n Testing route: {route} ({name})...")
            try:
                response = await page.goto(url, wait_until="networkidle", timeout=15000)
                status = response.status if response else "Unknown"
                
                # Check for critical errors or blank page
                title = await page.title()
                content = await page.content()
                is_blank = len(content.strip()) < 100
                
                # Take screenshot
                screenshot_filename = f"frontend_test_results/{name}.png"
                await page.screenshot(path=screenshot_filename, full_page=True)
                
                res_info = {
                    "route": route,
                    "name": name,
                    "status": status,
                    "title": title,
                    "blank": is_blank,
                    "screenshot": screenshot_filename,
                    "success": not is_blank and status < 400
                }
                results.append(res_info)
                print(f"    Status: {status} | Title: '{title}' | Screenshot: {screenshot_filename}")
                print(f"   {' PASS' if res_info['success'] else ' FAIL'}")
                
            except Exception as e:
                print(f"    Error accessing {route}: {e}")
                results.append({
                    "route": route,
                    "name": name,
                    "status": "ERROR",
                    "error": str(e),
                    "success": False
                })
        
        # Test basic interactive element (Language Toggle or Navigation link)
        print("\n Testing Interactive Navigation...")
        try:
            await page.goto("http://localhost:5173/", wait_until="networkidle")
            # Look for language toggle or buttons
            buttons = await page.locator("button").all()
            print(f"   Found {len(buttons)} interactive buttons on the homepage.")
            
            # Check for header nav links
            nav_links = await page.locator("nav a").all()
            print(f"   Found {len(nav_links)} navigation links.")
            
        except Exception as e:
            print(f"    Interactive test error: {e}")
            
        await browser.close()
        
    print("\n" + "=" * 60)
    print(" SUMMARY OF TEST RESULTS")
    print("=" * 60)
    passed = sum(1 for r in results if r.get("success"))
    total = len(results)
    print(f"Passed: {passed}/{total} routes ({passed/total*100:.1f}%)")
    
    if console_errors:
        print(f"\n Captured {len(console_errors)} console errors:")
        for err in console_errors[:5]:
            print(f"   - {err}")
    else:
        print("\n Zero browser console errors recorded!")
        
    print("=" * 60)
    
if __name__ == "__main__":
    asyncio.run(run_tests())
