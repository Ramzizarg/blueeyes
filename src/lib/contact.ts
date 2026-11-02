export const EMAIL = "hello@blueeyes.work";

// International format, digits only (e.g. "33612345678"). WhatsApp links stay hidden while empty.
export const WHATSAPP_NUMBER = "";

export const hasWhatsapp = WHATSAPP_NUMBER.length > 0;

export const whatsappUrl = (text?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
