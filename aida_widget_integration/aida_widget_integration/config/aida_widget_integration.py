from frappe import _

def get_data():
    return [
        {
            "label": _("AIDA Widget Integration"),
            "items": [
                {
                    "type": "doctype",
                    "name": "AIDA Widget Settings",
                    "label": _("AIDA Widget Settings"),
                    "description": _("Configure AIDA chat widget settings")
                }
            ]
        }
    ]