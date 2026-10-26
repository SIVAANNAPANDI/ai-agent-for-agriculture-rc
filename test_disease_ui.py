"""
AgriAssist - Leaf Disease Scanner End-to-End Playwright UI Verification
Automates image upload, model inference execution, and UI verification.
"""

import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

# Ensure stdout handles UTF-8 characters safely on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, str(Path(__file__).parent / "backend"))
from app.core.security import create_access_token


async def run_disease_scanner_ui_test():
    """Runs end-to-end diagnosis test in headless Chrome."""
    print("=" * 60)
    print("🔬 RUNNING LEAF DISEASE SCANNER UI VERIFICATION TEST")
    print("=" * 60)

    # Generate test JWT token for active user sivaa (user_id=27)
    token = create_access_token(data={"sub": "27"})
    user_data = {
        "id": 27,
        "name": "sivaa",
        "email": "siv@gmail.com",
        "phone": "9787128843",
        "role": "farmer",
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        # Suppress non-critical console noise while capturing errors
        page.on(
            "console",
            lambda msg: print(f"  [Browser Console] {msg.text}")
            if msg.type in ("error", "warning")
            else None,
        )

        # 1. Initialize session by navigating to /login and injecting token
        print("1. Injecting authentication credentials...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await page.evaluate(
            f"""() => {{
                localStorage.setItem("agriassist_token", "{token}");
                localStorage.setItem("agriassist_user", JSON.stringify({json.dumps(user_data)}));
            }}"""
        )

        # 2. Navigate directly to /disease page
        print("2. Navigating to Leaf Disease Scanner (/disease)...")
        await page.goto("http://localhost:5173/disease", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 3. Locate test leaf photograph
        test_img = Path(
            r"c:\Users\A.siva\OneDrive\Desktop\agriassist\model\data\processed\train\Pepper__bell___Bacterial_spot\0022d6b7-d47c-4ee2-ae9a-392a53f48647___JR_B.Spot 8964.JPG"
        )
        if not test_img.exists():
            print(f"❌ Test image not found at: {test_img}")
            await browser.close()
            return

        print(f"3. Uploading sample leaf image: {test_img.name}...")
        file_input = page.locator('input[type="file"]').first
        await file_input.set_input_files(str(test_img))
        await page.wait_for_timeout(1000)

        # 4. Trigger AI neural classification
        print("4. Clicking 'Diagnose Leaf Disease' button...")
        diagnose_btn = page.locator('button:has-text("Diagnose Leaf Disease")')
        await diagnose_btn.click()

        # 5. Await diagnosis results
        print("5. Waiting for neural diagnosis result to render...")
        await page.wait_for_selector("text=Bacterial", timeout=45000)
        print("✅ Diagnostic Report card rendered successfully!")

        await page.wait_for_timeout(2000)
        screenshot_path = Path(__file__).parent / "disease_result.png"
        await page.screenshot(path=str(screenshot_path), full_page=True)
        print(f"📸 Full-page verification screenshot saved to: {screenshot_path}")

        await browser.close()

    print("=" * 60)
    print("🎉 ALL TESTS PASSED: Leaf disease diagnosis verified end-to-end!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_disease_scanner_ui_test())
