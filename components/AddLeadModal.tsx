"use client";
import { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, SelectItem
} from "@heroui/react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const statuses = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "lost", label: "Lost" }
];

const inputCls = {
  input: "font-mono text-sm",
  inputWrapper: "bg-base-300 border-white/10 hover:border-white/20 focus-within:!border-primary data-[hover=true]:bg-base-300"
};

export function AddLeadModal({ isOpen, onClose, onCreated }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "",
    status: "new", lastContactedAt: today, notes: ""
  });
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.lastContactedAt) {
      toast.error("Name, email, and last contacted date are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to add lead");
        return;
      }
      toast.success(`${form.name} added to pipeline`);
      setForm({ name: "", email: "", company: "", phone: "", status: "new", lastContactedAt: today, notes: "" });
      onCreated();
      onClose();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        base: "bg-base-200 border border-white/[0.07]",
        header: "border-b border-white/[0.07] pb-3",
        footer: "border-t border-white/[0.07] pt-3",
        closeButton: "hover:bg-white/5"
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div>
            <h2 className="text-base font-semibold">Add lead</h2>
            <p className="text-xs font-mono text-base-content/40 mt-0.5">New contact to track</p>
          </div>
        </ModalHeader>
        <ModalBody className="py-5 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full name *" value={form.name} onValueChange={v => set("name", v)} variant="bordered" classNames={inputCls} />
            <Input label="Email *" type="email" value={form.email} onValueChange={v => set("email", v)} variant="bordered" classNames={inputCls} />
            <Input label="Company" value={form.company} onValueChange={v => set("company", v)} variant="bordered" classNames={inputCls} />
            <Input label="Phone" value={form.phone} onValueChange={v => set("phone", v)} variant="bordered" classNames={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              selectedKeys={[form.status]}
              onSelectionChange={k => set("status", Array.from(k)[0] as string)}
              variant="bordered"
              classNames={{ trigger: "bg-base-300 border-white/10 hover:border-white/20 data-[hover=true]:bg-base-300", value: "font-mono text-sm" }}
            >
              {statuses.map(s => <SelectItem key={s.key}>{s.label}</SelectItem>)}
            </Select>
            <Input
              label="Last contacted *"
              type="date"
              value={form.lastContactedAt}
              onValueChange={v => set("lastContactedAt", v)}
              variant="bordered"
              classNames={inputCls}
            />
          </div>
          <Textarea
            label="Notes"
            value={form.notes}
            onValueChange={v => set("notes", v)}
            variant="bordered"
            minRows={2}
            classNames={{ input: "font-mono text-sm", inputWrapper: "bg-base-300 border-white/10 hover:border-white/20 focus-within:!border-primary data-[hover=true]:bg-base-300" }}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} className="font-mono text-sm">Cancel</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading} className="font-semibold">
            Add lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
