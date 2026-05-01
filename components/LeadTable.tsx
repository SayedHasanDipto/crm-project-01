"use client";
import { useState, useMemo } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Button, Tooltip, useDisclosure,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, Textarea
} from "@heroui/react";
import { differenceInDays, format } from "date-fns";
import toast from "react-hot-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "lost";
  lastContactedAt: string;
  notes?: string;
}

interface Props {
  leads: Lead[];
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  new: "secondary",
  contacted: "primary",
  qualified: "success",
  lost: "danger"
};

const statuses = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "lost", label: "Lost" }
];

function getInitials(name: string) {
  return name.trim().split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-secondary/20 text-secondary",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
  "bg-info/20 text-info",
  "bg-error/20 text-error"
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xfffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const inputCls = {
  input: "font-mono text-sm",
  inputWrapper: "bg-base-300 border-white/10 hover:border-white/20 focus-within:!border-primary data-[hover=true]:bg-base-300"
};

export function LeadTable({ leads, onRefresh }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = leads;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.company ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(l => l.status === statusFilter);
    return [...list].sort((a, b) => new Date(a.lastContactedAt).getTime() - new Date(b.lastContactedAt).getTime());
  }, [leads, search, statusFilter]);

  function openEdit(lead: Lead) { setEditing({ ...lead }); onOpen(); }

  async function touchLead(lead: Lead) {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContactedAt: today, status: lead.status === "new" ? "contacted" : lead.status })
      });
      if (res.ok) { toast.success(`Marked ${lead.name} as contacted today`); onRefresh(); }
      else toast.error("Failed to update");
    } catch { toast.error("Network error"); }
  }

  async function deleteLead(id: string, name: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success(`${name} removed`); onRefresh(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Network error"); }
    finally { setDeleting(null); }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          email: editing.email,
          company: editing.company,
          phone: editing.phone,
          status: editing.status,
          lastContactedAt: editing.lastContactedAt,
          notes: editing.notes
        })
      });
      if (res.ok) { toast.success("Lead updated"); onRefresh(); onClose(); }
      else toast.error("Failed to update");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  }

  function setE(field: keyof Lead, value: string) {
    setEditing(prev => prev ? { ...prev, [field]: value } : prev);
  }

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center">
        <Input
          placeholder="Search by name, email, company..."
          value={search}
          onValueChange={setSearch}
          variant="bordered"
          size="sm"
          startContent={
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-base-content/30">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          }
          classNames={{
            input: "font-mono text-sm",
            inputWrapper: "bg-base-200 border-white/[0.07] h-9"
          }}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="select select-bordered select-sm bg-base-200 border-white/[0.07] font-mono text-xs h-9 min-h-0"
        >
          <option value="all">All statuses</option>
          {statuses.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <span className="font-mono text-xs text-base-content/30 ml-auto">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <Table
        aria-label="Leads table"
        removeWrapper
        classNames={{
          base: "rounded-xl overflow-hidden border border-white/[0.07]",
          th: "bg-base-300 text-base-content/40 font-mono text-[10px] uppercase tracking-widest border-b border-white/[0.07]",
          td: "border-b border-white/[0.04] py-3"
        }}
      >
        <TableHeader>
          <TableColumn>Lead</TableColumn>
          <TableColumn>Company</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Last contact</TableColumn>
          <TableColumn>Days silent</TableColumn>
          <TableColumn className="text-right">Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent={
          <div className="py-12 text-base-content/20 font-mono text-sm">No leads found</div>
        }>
          {filtered.map(lead => {
            const days = differenceInDays(new Date(), new Date(lead.lastContactedAt));
            const overdue = days >= 3;
            return (
              <TableRow key={lead._id} className={overdue ? "overdue-row" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`avatar-initials ${avatarColor(lead.name)}`}>
                      {getInitials(lead.name)}
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-tight">{lead.name}</p>
                      <p className="font-mono text-xs text-base-content/40">{lead.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-base-content/50">{lead.company || "—"}</span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={STATUS_COLORS[lead.status]} variant="flat" className="font-mono text-[11px]">
                    {lead.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-base-content/60">
                    {format(new Date(lead.lastContactedAt), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {overdue && <div className="pulse-dot" />}
                    <span className={`font-mono text-sm font-medium ${overdue ? "text-error" : "text-base-content/60"}`}>
                      {days === 0 ? "today" : `${days}d`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 justify-end">
                    <Tooltip content="Mark contacted today" placement="top" classNames={{ content: "font-mono text-xs" }}>
                      <Button
                        size="sm" variant="flat" isIconOnly
                        className="w-7 h-7 min-w-0 bg-success/10 text-success border border-success/20 hover:bg-success/20"
                        onPress={() => touchLead(lead)}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit lead" placement="top" classNames={{ content: "font-mono text-xs" }}>
                      <Button
                        size="sm" variant="flat" isIconOnly
                        className="w-7 h-7 min-w-0 bg-white/5 text-base-content/50 border border-white/10 hover:bg-white/10 hover:text-base-content"
                        onPress={() => openEdit(lead)}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete" placement="top" classNames={{ content: "font-mono text-xs text-error" }}>
                      <Button
                        size="sm" variant="flat" isIconOnly
                        isLoading={deleting === lead._id}
                        className="w-7 h-7 min-w-0 bg-error/10 text-error border border-error/20 hover:bg-error/20"
                        onPress={() => deleteLead(lead._id, lead.name)}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      {editing && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg"
          classNames={{
            base: "bg-base-200 border border-white/[0.07]",
            header: "border-b border-white/[0.07]",
            footer: "border-t border-white/[0.07]",
            closeButton: "hover:bg-white/5"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <div>
                <h2 className="text-base font-semibold">Edit lead</h2>
                <p className="text-xs font-mono text-base-content/40">{editing.email}</p>
              </div>
            </ModalHeader>
            <ModalBody className="py-5 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full name" value={editing.name} onValueChange={v => setE("name", v)} variant="bordered" classNames={inputCls} />
                <Input label="Email" type="email" value={editing.email} onValueChange={v => setE("email", v)} variant="bordered" classNames={inputCls} />
                <Input label="Company" value={editing.company ?? ""} onValueChange={v => setE("company", v)} variant="bordered" classNames={inputCls} />
                <Input label="Phone" value={editing.phone ?? ""} onValueChange={v => setE("phone", v)} variant="bordered" classNames={inputCls} />
                <Select
                  label="Status"
                  selectedKeys={[editing.status]}
                  onSelectionChange={k => setE("status", Array.from(k)[0] as string)}
                  variant="bordered"
                  classNames={{ trigger: "bg-base-300 border-white/10 hover:border-white/20", value: "font-mono text-sm" }}
                >
                  {statuses.map(s => <SelectItem key={s.key}>{s.label}</SelectItem>)}
                </Select>
                <Input
                  label="Last contacted"
                  type="date"
                  value={editing.lastContactedAt.split("T")[0]}
                  onValueChange={v => setE("lastContactedAt", v)}
                  variant="bordered"
                  classNames={inputCls}
                />
              </div>
              <Textarea
                label="Notes"
                value={editing.notes ?? ""}
                onValueChange={v => setE("notes", v)}
                variant="bordered"
                minRows={2}
                classNames={{ input: "font-mono text-sm", inputWrapper: "bg-base-300 border-white/10 hover:border-white/20 focus-within:!border-primary data-[hover=true]:bg-base-300" }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} className="font-mono text-sm">Cancel</Button>
              <Button color="primary" onPress={saveEdit} isLoading={saving} className="font-semibold">Save changes</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
