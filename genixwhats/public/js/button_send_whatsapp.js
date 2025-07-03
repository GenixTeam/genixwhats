frappe.call({
    method: 'genixwhats.overrides.notifications.get_all_doctypes',
    callback: function(r) {
        const allowedDoctypes = r.message || [];

        allowedDoctypes.forEach(doctype => {
            frappe.ui.form.on(doctype, {
                refresh: function(frm) {

   				const button_html = `
  				<span class="whatsapp-btn-icon" style="
  				  display: inline-flex;
  				  align-items: center;
  				  gap: 6px;
  				  justify-content: center;
  				  cursor: pointer;
  				  padding: 4px 8px;
  				  border: 1px solid var(--btn-default-border);
  				  border-radius: 6px;
 			      background-color: var(--btn-default);
  				  color: var(--btn-default-text);
  				  transition: background-color 0.2s ease, border-color 0.2s ease;  "
  				  
 				  onmouseover="this.style.backgroundColor='var(--btn-default-hover-bg)';
 				  this.style.borderColor='var(--btn-default-hover-border)';"
 				 onmouseout="this.style.backgroundColor='var(--btn-default)'; 
 				 this.style.borderColor='var(--btn-default-border)';">
   				 <i class="fa fa-whatsapp"></i>
    	<span class="spinner-border spinner-border-sm" style="display:none; margin-left: 0;"></span>
 			 </span>
				`;


                    let $btn = frm.add_custom_button(button_html, function () {
                        const $icon = $btn.find('.fa-whatsapp');
                        const $spinner = $btn.find('.spinner-border');

                        $btn.prop('disabled', true);  
                        $icon.hide();                 
                        $spinner.show();               

                        frappe.call({
                            method: 'genixwhats.overrides.notifications.get_whatsapp_notifications',
                            args: { doctype },
                            callback: res => {
                                const notifications = res.message || [];

                                if (!notifications.length) {
                                    frappe.msgprint(__('No WhatsApp notifications available.'));
                                    $spinner.hide();
                                    $icon.show();
                                    $btn.prop('disabled', false);
                                    return;
                                }

                                const notification_name = notifications[0].name;

                                frappe.call({
                                    method: 'genixwhats.overrides.notifications.send_whatsapp_file',
                                    args: {
                                        docname: frm.doc.name,
                                        doctype: frm.doc.doctype,
                                        notification_name
                                    },
                                    callback: () => {
                                        $spinner.hide();
                                        $icon.show();
                                        $btn.prop('disabled', false);
                                        frappe.show_alert({
                                            message: __('Sent via: ' + notification_name),
                                            indicator: 'green'
                                        });
                                    },
                                    error: () => {
                                        $spinner.hide();
                                        $icon.show();
                                        $btn.prop('disabled', false);
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

