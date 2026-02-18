
-- Notification template types
CREATE TYPE public.notification_trigger AS ENUM (
  'request_created',
  'request_approved',
  'anesthesia_date_set',
  'surgery_date_agreed',
  'manual'
);

CREATE TYPE public.notification_channel AS ENUM ('sms', 'whatsapp', 'both');

CREATE TYPE public.template_target AS ENUM ('patient', 'doctor', 'coordinator', 'all');

CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- SMS/WhatsApp message templates
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  trigger_event notification_trigger NOT NULL DEFAULT 'manual',
  channel notification_channel NOT NULL DEFAULT 'whatsapp',
  target template_target NOT NULL DEFAULT 'patient',
  target_specialty TEXT,
  target_doctor_id TEXT,
  content TEXT NOT NULL,
  ai_generated_content TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  approved_by UUID,
  approval_status approval_status NOT NULL DEFAULT 'approved',
  approval_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification send log
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.notification_templates(id),
  request_id TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  recipient_role TEXT,
  channel notification_channel NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by UUID
);

-- Template change approval requests
CREATE TABLE public.template_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  old_content TEXT,
  new_content TEXT NOT NULL,
  new_title TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Users who can approve template changes (admin delegates)
CREATE TABLE public.template_approvers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_approvers ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_templates
CREATE POLICY "Admins can manage all templates"
ON public.notification_templates FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approvers can view templates"
ON public.notification_templates FOR SELECT
USING (EXISTS (SELECT 1 FROM public.template_approvers WHERE user_id = auth.uid()));

CREATE POLICY "Users can view active templates"
ON public.notification_templates FOR SELECT
USING (is_active = true AND approval_status = 'approved');

-- RLS policies for notification_logs
CREATE POLICY "Admins can view all logs"
ON public.notification_logs FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their sent logs"
ON public.notification_logs FOR SELECT
USING (sent_by = auth.uid());

-- RLS policies for template_approvals
CREATE POLICY "Admins can manage approvals"
ON public.template_approvals FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approvers can manage approvals"
ON public.template_approvals FOR ALL
USING (EXISTS (SELECT 1 FROM public.template_approvers WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own approval requests"
ON public.template_approvals FOR SELECT
USING (requested_by = auth.uid());

CREATE POLICY "Users can create approval requests"
ON public.template_approvals FOR INSERT
WITH CHECK (requested_by = auth.uid());

-- RLS policies for template_approvers
CREATE POLICY "Admins can manage approvers"
ON public.template_approvers FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approvers can view themselves"
ON public.template_approvers FOR SELECT
USING (user_id = auth.uid());

-- Update trigger
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
