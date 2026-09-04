from __future__ import annotations

import hashlib
import importlib.util
import json
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILDER_PATH = ROOT / "scripts" / "build_store_package.py"

spec = importlib.util.spec_from_file_location("store_builder", BUILDER_PATH)
store_builder = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(store_builder)


class StorePackageTests(unittest.TestCase):
    def test_store_zip_contains_only_runtime_allowlist_with_manifest_at_root(self):
        output = store_builder.build_package()
        self.addCleanup(lambda: output.unlink(missing_ok=True))
        with zipfile.ZipFile(output) as archive:
            names = archive.namelist()
            self.assertEqual(names, list(store_builder.RUNTIME_FILES))
            self.assertEqual(names[0], "manifest.json")
            self.assertNotIn("master_blocklist.json", names)
            self.assertFalse(any(name.startswith("tests/") for name in names))
            self.assertFalse(any(name.startswith(".github/") for name in names))
            self.assertFalse(any(name.startswith("docs/") for name in names))
            manifest = json.loads(archive.read("manifest.json"))
            self.assertEqual(manifest["manifest_version"], 3)
            self.assertEqual(manifest["version"], "1.9.0")

    def test_store_package_build_is_byte_deterministic(self):
        first = store_builder.build_package()
        first_bytes = first.read_bytes()
        first.unlink()
        second = store_builder.build_package()
        self.addCleanup(lambda: second.unlink(missing_ok=True))
        second_bytes = second.read_bytes()
        self.assertEqual(hashlib.sha256(first_bytes).digest(), hashlib.sha256(second_bytes).digest())


if __name__ == "__main__":
    unittest.main()
