from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Import version from the package
try:
    from aida_widget_integration import __version__
except ImportError:
    __version__ = "0.0.1"

setup(
    name="aida_widget_integration",
    version=__version__,
    author="AIDA Team",
    author_email="support@aida.com",
    description="A Frappe app that integrates AIDA AI assistant as a floating chat widget in Mocxha",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/aida-team/aida-widget-integration",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Web Environment",
        "Framework :: Frappe",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Office/Business",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
    ],
    python_requires=">=3.10",
    install_requires=[
        "requests>=2.25.0",
    ],
    include_package_data=True,
    zip_safe=False,
)