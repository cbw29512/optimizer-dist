from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ExtensionReleaseContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
        cls.background = (ROOT / "src" / "background.js").read_text(encoding="utf-8")
        cls.content = (ROOT / "src" / "content.js").read_text(encoding="utf-8")
        cls.popup = (ROOT / "ui" / "popup.js").read_text(encoding="utf-8")

    def test_manifest_v3_permissions_are_explicit_and_minimal_for_current_design(self):
        self.assertEqual(self.manifest["manifest_version"], 3)
        self.assertEqual(set(self.manifest["permissions"]), {"storage", "declarativeNetRequest", "alarms"})
        self.assertEqual(self.manifest["host_permissions"], ["<all_urls>"])
        self.assertEqual(self.manifest["content_scripts"][0]["matches"], ["<all_urls>"])
        forbidden = {"tabs", "history", "cookies", "webRequest", "scripting", "management"}
        self.assertTrue(forbidden.isdisjoint(set(self.manifest["permissions"])))
        self.assertNotIn("update_url", self.manifest)

    def test_every_manifest_runtime_file_exists(self):
        paths = [
            self.manifest["background"]["service_worker"],
            self.manifest["action"]["default_popup"],
            self.manifest["declarative_net_request"]["rule_resources"][0]["path"],
            *self.manifest["content_scripts"][0]["js"],
            *self.manifest["icons"].values(),
            *self.manifest["action"]["default_icon"].values(),
        ]
        for relative in paths:
            self.assertTrue((ROOT / relative).is_file(), relative)

    def test_rule_files_are_valid_arrays_with_unique_positive_ids(self):
        for filename in ("rules.json", "master_blocklist.json"):
            rules = json.loads((ROOT / filename).read_text(encoding="utf-8"))
            self.assertIsInstance(rules, list)
            ids = [rule["id"] for rule in rules]
            self.assertEqual(len(ids), len(set(ids)), filename)
            self.assertTrue(all(isinstance(rule_id, int) and rule_id > 0 for rule_id in ids), filename)
            self.assertTrue(all(rule.get("action", {}).get("type") == "block" for rule in rules), filename)

    def test_enable_disable_routes_through_single_background_controller(self):
        self.assertIn("message?.action !== 'setEnabled'", self.background)
        self.assertIn("setEnabledState(Boolean(message.enabled))", self.background)
        self.assertIn("updateEnabledRulesets", self.background)
        self.assertIn("else await clearDynamicRules()", self.background)
        self.assertIn("chrome.runtime.sendMessage({ action: 'setEnabled'", self.popup)
        self.assertNotIn("chrome.storage.local.set({ enabled:", self.popup)
        self.assertIn("if (message.enabled) startEngine();", self.content)
        self.assertIn("else stopEngine();", self.content)
        self.assertIn("observer.disconnect()", self.content)

    def test_remote_refresh_is_single_purpose_and_fail_safe(self):
        expected = "https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json"
        self.assertIn(expected, self.background)
        urls = re.findall(r"https://[^\"']+", self.background + "\n" + self.content + "\n" + self.popup)
        self.assertEqual(urls, [expected])
        self.assertIn("if (!(await getEnabled())) return;", self.background)
        self.assertIn("if (!Array.isArray(newRules))", self.background)
        self.assertIn("keeping packaged static rules and existing dynamic rules", self.background)
        catch_block = self.background.split("} catch (error) {", 1)[1]
        self.assertNotIn("clearDynamicRules()", catch_block.split("}\n}", 1)[0])

    def test_source_does_not_claim_a_conflicting_version(self):
        version = self.manifest["version"]
        for path in (ROOT / "src").glob("*.js"):
            text = path.read_text(encoding="utf-8")
            claimed = re.findall(r"Web Stream Optimizer v([0-9]+(?:\.[0-9]+)*)", text)
            self.assertTrue(all(value == version for value in claimed), path.name)

    def test_generated_or_stale_distribution_artifacts_are_not_tracked(self):
        self.assertFalse((ROOT / "_metadata").exists())
        self.assertFalse((ROOT / "update.xml").exists())
        self.assertFalse((ROOT / "README.txt").exists())


if __name__ == "__main__":
    unittest.main()
