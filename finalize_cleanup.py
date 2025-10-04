#!/usr/bin/env python3
"""
Final cleanup script to organize the repository
"""

import os
import shutil

def cleanup_repository():
    """Clean up the repository structure."""
    print("🧹 Starting repository cleanup...")
    
    # Remove empty directories
    empty_dirs = ['backend', 'frontend', '__pycache__']
    for dir_name in empty_dirs:
        if os.path.exists(dir_name):
            try:
                shutil.rmtree(dir_name)
                print(f"✅ Removed {dir_name}/")
            except Exception as e:
                print(f"❌ Failed to remove {dir_name}/: {e}")
    
    # Verify final structure
    print("\n📁 Final repository structure:")
    for root, dirs, files in os.walk('.'):
        level = root.replace('.', '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f"{subindent}{file}")
    
    print("\n✅ Repository cleanup complete!")

if __name__ == "__main__":
    cleanup_repository()
