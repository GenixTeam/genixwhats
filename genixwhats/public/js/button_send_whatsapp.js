frappe.call({
    method: 'genixwhats.overrides.notifications.get_all_doctypes',
    callback: function(r) {
        const allowedDoctypes = r.message || [];

        allowedDoctypes.forEach(doctype => {
            frappe.ui.form.on(doctype, {
                refresh: function(frm) {
                 if (!$('#whatsapp-loader').length) {
            $('body').append('<div id="whatsapp-loader"></div>');
          }
                    frm.add_custom_button(__('Send WhatsApp PDF'), () => {
                        frappe.call({
                            method: 'genixwhats.overrides.notifications.get_whatsapp_notifications',
                            args: { doctype },
                            callback: res => {
                                const notifications = res.message || [];

                                if (!notifications.length) {
                                    frappe.msgprint(__('No WhatsApp notifications available.'));
                                    return;
                                }

                                const notification_name = notifications[0].name;

                                $('#whatsapp-loader').show();

                                frappe.call({
                                    method: 'genixwhats.overrides.notifications.send_whatsapp_file',
                                    args: {
                                        docname: frm.doc.name,
                                        doctype: frm.doc.doctype,
                                        notification_name
                                    },
                                    callback: () => {
                                        $('#whatsapp-loader').hide(); 
                                        frappe.show_alert({
                                            message: __('Sent via: ' + notification_name),
                                            indicator: 'green'
                                        });
                                    },
                                    error: () => {
                                        $('#whatsapp-loader').hide();  
                                        frappe.show_alert({
                                            message: __('Error while sending via: ' + notification_name),
                                            indicator: 'red'
                                        });
                                    }
                                });
                            }
                        });
                    }).addClass('btn-primary');
                }
            });
        });
    }
});

