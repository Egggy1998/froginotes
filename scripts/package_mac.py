import zipfile
import os
import re

CACHE_DIR = os.path.expanduser('~/.cache/electron-mac')
APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(APP_ROOT, 'release-builds', 'mac')
os.makedirs(OUT_DIR, exist_ok=True)

ARCHS = [
    ('arm64', 'electron-v34.5.8-darwin-arm64.zip', 'FrogiNotes-v1.0.0-macos-arm64.zip'),
    ('x64', 'electron-v34.5.8-darwin-x64.zip', 'FrogiNotes-v1.0.0-macos-x64.zip')
]

def update_plist(plist_str):
    plist_str = re.sub(r'<key>CFBundleDisplayName</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleDisplayName</key>\n\t<string>FrogiNotes</string>', plist_str)
    plist_str = re.sub(r'<key>CFBundleExecutable</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleExecutable</key>\n\t<string>FrogiNotes</string>', plist_str)
    plist_str = re.sub(r'<key>CFBundleName</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleName</key>\n\t<string>FrogiNotes</string>', plist_str)
    plist_str = re.sub(r'<key>CFBundleIdentifier</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleIdentifier</key>\n\t<string>com.froginotes.app</string>', plist_str)
    plist_str = re.sub(r'<key>CFBundleShortVersionString</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleShortVersionString</key>\n\t<string>1.0.0</string>', plist_str)
    plist_str = re.sub(r'<key>CFBundleVersion</key>\s*<string>[^<]+</string>',
                       '<key>CFBundleVersion</key>\n\t<string>1.0.0</string>', plist_str)
    return plist_str

def build_mac_zip(arch, source_zip_name, out_zip_name):
    source_zip_path = os.path.join(CACHE_DIR, source_zip_name)
    out_zip_path = os.path.join(OUT_DIR, out_zip_name)

    print(f"\n==========================================")
    print(f"Packaging macOS {arch} -> {out_zip_name}")
    print(f"==========================================")

    with zipfile.ZipFile(source_zip_path, 'r') as src_z, \
         zipfile.ZipFile(out_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as out_z:

        # 1. Copy all files from Electron.app, renaming to FrogiNotes.app
        for item in src_z.infolist():
            orig_name = item.filename

            # Skip non-app files like LICENSE, version, etc.
            if not orig_name.startswith('Electron.app/'):
                continue

            # Rename Electron.app -> FrogiNotes.app
            new_name = orig_name.replace('Electron.app/', 'FrogiNotes.app/', 1)

            # Rename main binary
            if new_name == 'FrogiNotes.app/Contents/MacOS/Electron':
                new_name = 'FrogiNotes.app/Contents/MacOS/FrogiNotes'

            # Read content
            content = src_z.read(item)

            # Update Info.plist
            if new_name == 'FrogiNotes.app/Contents/Info.plist':
                content = update_plist(content.decode('utf-8')).encode('utf-8')

            # Create new ZipInfo to preserve permissions and symlinks
            zinfo = zipfile.ZipInfo(new_name, date_time=item.date_time)
            zinfo.external_attr = item.external_attr
            zinfo.compress_type = zipfile.ZIP_DEFLATED

            out_z.writestr(zinfo, content)

        # 2. Add our app files into FrogiNotes.app/Contents/Resources/app/
        app_files = []

        # package.json
        app_files.append((os.path.join(APP_ROOT, 'package.json'), 'package.json'))

        # electron folder
        for root, _, files in os.walk(os.path.join(APP_ROOT, 'electron')):
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, APP_ROOT)
                app_files.append((full_p, rel_p))

        # dist folder
        for root, _, files in os.walk(os.path.join(APP_ROOT, 'dist')):
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, APP_ROOT)
                app_files.append((full_p, rel_p))

        for full_path, rel_path in app_files:
            target_in_zip = f"FrogiNotes.app/Contents/Resources/app/{rel_path.replace(os.sep, '/')}"
            zinfo = zipfile.ZipInfo(target_in_zip)
            zinfo.external_attr = 0o100644 << 16  # Regular file with rw-r--r--
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            with open(full_path, 'rb') as f:
                out_z.writestr(zinfo, f.read())

    size_mb = os.path.getsize(out_zip_path) / (1024 * 1024)
    print(f"Successfully generated: {out_zip_name} ({size_mb:.1f} MB)")
    return out_zip_path

def main():
    for arch, src, out in ARCHS:
        build_mac_zip(arch, src, out)
    print("\nAll macOS builds packaged successfully!")

if __name__ == '__main__':
    main()
