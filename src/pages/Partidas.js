import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const STATUS_COLOR = { COMPLETED: "#10b981", ABANDONED: "#ef4444", PAUSED: "#f59e0b" };
const STATUS_LABEL = { COMPLETED: "Completada", ABANDONED: "Abandonada", PAUSED: "Pausada" };
const DIFF_COLOR   = { EASY: "#10b981", MEDIUM: "#f59e0b", HARD: "#ef4444" };
const DIFF_LABEL   = { EASY: "Fácil", MEDIUM: "Media", HARD: "Difícil" };
const DIFF_ICON    = { EASY: "🟢", MEDIUM: "🟡", HARD: "🔴" };
const STATUS_ICON  = { COMPLETED: "✓", ABANDONED: "✕", PAUSED: "⏸" };

function fmtDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Estilos del formulario compartidos ─────────────────────────── */
const GLOBAL_STYLE = `
  @keyframes spin{to{transform:rotate(360deg)}}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
  input[type=number]{-moz-appearance:textfield}
`;

/* ── Formulario nueva partida ───────────────────────────────────── */
function FormPartida({ juegos, userId, onCreated, onCancel }) {
  const [form, setForm] = useState({
  gameId: juegos.length > 0 ? "1" : "",
  score: "", durationMinutes: "", durationSeconds: "",
  level: "", difficulty: "MEDIUM", status: "COMPLETED",
});
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const durSecs = (parseInt(form.durationMinutes || 0) * 60) + parseInt(form.durationSeconds || 0);
    const now = new Date().toISOString().slice(0, 19);
    try {
      await api.crearPartida({
      userId: Number(userId),
      gameId: Number(form.gameId),
      score: Number(form.score),
      durationSeconds: durSecs,
      level: Number(form.level) || 1,
      difficulty: form.difficulty,
      status: form.status,
      startTime: now,
      endTime: now,
  });
      onCreated();
    } catch { setError("Error al registrar la partida"); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.formOverlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <style>{GLOBAL_STYLE}</style>
      <div style={s.formCard}>
        <div style={s.formHeader}>
          <div style={s.formHeaderLeft}>
            <div style={s.formIconBadge}>🎮</div>
            <div>
              <h3 style={s.formTitle}>Registrar partida</h3>
              <p style={s.formSubtitle}>Añade una sesión a tu historial</p>
            </div>
          </div>
          <button style={s.closeBtn} type="button" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ ...s.formField, marginBottom: "1.25rem" }}>
            <label style={s.label}>Juego</label>
            <select style={s.input} value={form.gameId} onChange={(e) => set("gameId", e.target.value)} required>
              {juegos.map((j, index) => (<option key={j._id} value={index + 1}>{j.title}</option>))}
            </select>
          </div>
          <FormFields form={form} set={set} />
          {error && <div style={s.formError}><span>⚠</span> {error}</div>}
          <div style={s.formActions}>
            <button type="button" style={s.cancelBtn} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.submitBtn} disabled={saving}>
              {saving ? <><span style={s.spinner} />Guardando...</> : "Guardar partida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Formulario editar partida ──────────────────────────────────── */
function FormEditarPartida({ session, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    score: session.score ?? "",
    durationMinutes: Math.floor((session.durationSeconds || 0) / 60),
    durationSeconds: (session.durationSeconds || 0) % 60,
    level: session.level ?? "",
    difficulty: session.difficulty || "MEDIUM",
    status: session.status || "COMPLETED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const durSecs = (parseInt(form.durationMinutes || 0) * 60) + parseInt(form.durationSeconds || 0);
    try {
      await api.editarPartida(session.id, {
        score: parseInt(form.score),
        durationSeconds: durSecs,
        level: parseInt(form.level) || 1,
        difficulty: form.difficulty,
        status: form.status,
      });
      onUpdated();
    } catch { setError("Error al actualizar la partida"); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.formOverlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <style>{GLOBAL_STYLE}</style>
      <div style={s.formCard}>
        <div style={s.formHeader}>
          <div style={s.formHeaderLeft}>
            <div style={{ ...s.formIconBadge, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>✏️</div>
            <div>
              <h3 style={s.formTitle}>Editar partida</h3>
              <p style={s.formSubtitle}>Sesión #{session.id}</p>
            </div>
          </div>
          <button style={s.closeBtn} type="button" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <FormFields form={form} set={set} />
          {error && <div style={s.formError}><span>⚠</span> {error}</div>}
          <div style={s.formActions}>
            <button type="button" style={s.cancelBtn} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.submitBtn} disabled={saving}>
              {saving ? <><span style={s.spinner} />Guardando...</> : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Campos compartidos entre crear y editar ────────────────────── */
function FormFields({ form, set }) {
  return (
    <>
      <div style={s.formRow}>
        <div style={s.formField}>
          <label style={s.label}>Puntuación</label>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>★</span>
            <input style={{ ...s.input, paddingLeft: "2rem" }} type="number" min="0"
              value={form.score} onChange={(e) => set("score", e.target.value)} placeholder="0" required />
          </div>
        </div>
        <div style={s.formField}>
          <label style={s.label}>Nivel</label>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>◈</span>
            <input style={{ ...s.input, paddingLeft: "2rem" }} type="number" min="1" max="100"
              value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="1" />
          </div>
        </div>
      </div>

      <div style={{ ...s.formField, marginBottom: "1.25rem" }}>
        <label style={s.label}>Duración</label>
        <div style={s.durationWrap}>
          <div style={s.durationPart}>
            <input style={s.durationInput} type="number" min="0" value={form.durationMinutes}
              onChange={(e) => set("durationMinutes", e.target.value)} placeholder="00" />
            <span style={s.durationUnit}>min</span>
          </div>
          <span style={s.durationSep}>:</span>
          <div style={s.durationPart}>
            <input style={s.durationInput} type="number" min="0" max="59" value={form.durationSeconds}
              onChange={(e) => set("durationSeconds", e.target.value)} placeholder="00" />
            <span style={s.durationUnit}>seg</span>
          </div>
        </div>
      </div>

      <div style={{ ...s.formField, marginBottom: "1.25rem" }}>
        <label style={s.label}>Dificultad</label>
        <div style={s.cardRow}>
          {Object.entries(DIFF_LABEL).map(([val, lbl]) => (
            <button key={val} type="button"
              style={form.difficulty === val
                ? { ...s.diffCard, background: `${DIFF_COLOR[val]}18`, borderColor: DIFF_COLOR[val], color: DIFF_COLOR[val] }
                : s.diffCard}
              onClick={() => set("difficulty", val)}
            >
              <span style={{ fontSize: "1.1rem" }}>{DIFF_ICON[val]}</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{lbl}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...s.formField, marginBottom: "1.5rem" }}>
        <label style={s.label}>Estado</label>
        <div style={s.cardRow}>
          {Object.entries(STATUS_LABEL).map(([val, lbl]) => (
            <button key={val} type="button"
              style={form.status === val
                ? { ...s.statusCard, background: `${STATUS_COLOR[val]}18`, borderColor: STATUS_COLOR[val], color: STATUS_COLOR[val] }
                : s.statusCard}
              onClick={() => set("status", val)}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700,
                background: form.status === val ? `${STATUS_COLOR[val]}30` : "rgba(255,255,255,0.05)",
                color: form.status === val ? STATUS_COLOR[val] : "#5a6080",
              }}>{STATUS_ICON[val]}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{lbl}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Tabla de sesiones ──────────────────────────────────────────── */
export function SesionesTabla({ sessions, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (!sessions || sessions.length === 0)
    return <p style={s.empty}>Sin partidas registradas.</p>;

  const handleDelete = (sess) => {
    if (confirmId === sess.id) {
      onDelete(sess.id);
      setConfirmId(null);
    } else {
      setConfirmId(sess.id);
    }
  };

  const showActions = onEdit || onDelete;

  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {["#", "Juego ID", "Score", "Duración", "Nivel", "Dificultad", "Estado", "Fecha",
              ...(showActions ? [""] : [])].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((sess, i) => (
            <tr key={sess.id} style={s.tr}>
              <td style={{ ...s.td, color: "#3a4060" }}>{i + 1}</td>
              <td style={{ ...s.td, color: "#e8eaf0", fontWeight: 600 }}>#{sess.gameId}</td>
              <td style={{ ...s.td, color: "#f97316", fontWeight: 700 }}>{(sess.score || 0).toLocaleString()}</td>
              <td style={{ ...s.td, color: "#94a3b8" }}>{fmtDuration(sess.durationSeconds)}</td>
              <td style={{ ...s.td, color: "#94a3b8" }}>{sess.level ?? "—"}</td>
              <td style={s.td}>
                {sess.difficulty
                  ? <span style={{ ...s.badge, background: `${DIFF_COLOR[sess.difficulty]}22`, color: DIFF_COLOR[sess.difficulty] }}>
                      {DIFF_LABEL[sess.difficulty] || sess.difficulty}
                    </span>
                  : "—"}
              </td>
              <td style={s.td}>
                {sess.status
                  ? <span style={{ ...s.badge, background: `${STATUS_COLOR[sess.status]}22`, color: STATUS_COLOR[sess.status] }}>
                      {STATUS_LABEL[sess.status] || sess.status}
                    </span>
                  : "—"}
              </td>
              <td style={{ ...s.td, color: "#5a6080", fontSize: "0.8rem" }}>{fmtDate(sess.endTime)}</td>
              {showActions && (
                <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                  {confirmId === sess.id ? (
                    <span style={{ display: "flex", gap: 6 }}>
                      <button style={s.btnConfirm} onClick={() => handleDelete(sess)}>Confirmar</button>
                      <button style={s.btnCancelRow} onClick={() => setConfirmId(null)}>No</button>
                    </span>
                  ) : (
                    <span style={{ display: "flex", gap: 6 }}>
                      {onEdit && (
                        <button style={s.btnEdit} onClick={() => onEdit(sess)}>✏</button>
                      )}
                      {onDelete && (
                        <button style={s.btnDelete} onClick={() => handleDelete(sess)}>✕</button>
                      )}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Página principal ───────────────────────────────────────────── */
export default function Partidas() {
  const { user }   = useAuth();
  const [sessions, setSessions]     = useState([]);
  const [juegos, setJuegos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [editSession, setEditSession] = useState(null);

  const cargarSesiones = () => {
    if (!user?.id) return;
    api.getPartidasUsuario(user.id)
      .then((r) => { setSessions(r.data); setError(null); })
      .catch(() => setError("No se pudo conectar al microservicio de Partidas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarSesiones(); }, [user]);

  useEffect(() => {
    api.getJuegos(1, null, null, null)
      .then((r) => setJuegos(r.data))
      .catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.eliminarPartida(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch { alert("Error al eliminar la partida"); }
  };

  const handleUpdated = () => {
    setEditSession(null);
    cargarSesiones();
  };

  if (loading) return null;
  if (error)   return <p style={s.error}>❌ {error}</p>;

  const totalScore = sessions.reduce((a, b) => a + (b.score || 0), 0);
  const bestScore  = sessions.length ? Math.max(...sessions.map((x) => x.score || 0)) : 0;
  const avgScore   = sessions.length ? Math.round(totalScore / sessions.length) : 0;
  const completed  = sessions.filter((x) => x.status === "COMPLETED").length;

  return (
    <div>
      {showForm && juegos.length > 0 && (
        <FormPartida
          juegos={juegos} userId={user.id}
          onCreated={() => { setShowForm(false); setLoading(true); cargarSesiones(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editSession && (
        <FormEditarPartida
          session={editSession}
          onUpdated={handleUpdated}
          onCancel={() => setEditSession(null)}
        />
      )}

      <div style={s.statsGrid}>
        {[
          { label: "Partidas jugadas", val: sessions.length },
          { label: "Puntuación total", val: totalScore.toLocaleString() },
          { label: "Mejor puntuación", val: bestScore.toLocaleString() },
          { label: "Media de puntos",  val: avgScore.toLocaleString() },
          { label: "Completadas",      val: completed },
        ].map(({ label, val }) => (
          <div key={label} style={s.statCard}>
            <p style={s.statVal}>{val}</p>
            <p style={s.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <div>
            <span style={s.tableTitle}>Historial de partidas</span>
            <span style={s.tableSub}> — {sessions.length} sesiones</span>
          </div>
          <button style={s.newBtn} onClick={() => setShowForm(true)}>+ Registrar partida</button>
        </div>
        <SesionesTabla
          sessions={sessions}
          onEdit={(sess) => setEditSession(sess)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

const s = {
  error: { color: "#ef4444", padding: "2rem" },
  empty: { color: "#5a6080", padding: "1rem 1.25rem", fontSize: "0.88rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "#0f1829", borderRadius: 12, padding: "1.25rem", textAlign: "center", border: "1px solid rgba(148,163,184,0.08)" },
  statVal: { fontSize: "1.5rem", fontWeight: 700, color: "#f97316", marginBottom: 4 },
  statLabel: { fontSize: "0.72rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em" },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  tableHeader: { padding: "1rem 1.25rem", borderBottom: "1px solid #1c1f30", display: "flex", justifyContent: "space-between", alignItems: "center" },
  tableTitle: { fontWeight: 600, fontSize: "0.95rem", color: "#e8eaf0" },
  tableSub: { fontSize: "0.8rem", color: "#5a6080" },
  newBtn: { padding: "0.45rem 1rem", background: "rgba(249,115,22,0.15)", border: "1px solid #f97316", borderRadius: 8, color: "#f97316", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#4d6080", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1c1f30", background: "#080d18" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#94a3b8" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 },
  btnEdit: { padding: "3px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 6, color: "#818cf8", fontSize: "0.78rem", cursor: "pointer" },
  btnDelete: { padding: "3px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#f87171", fontSize: "0.78rem", cursor: "pointer" },
  btnConfirm: { padding: "3px 8px", background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: 6, color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  btnCancelRow: { padding: "3px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#5a6080", fontSize: "0.75rem", cursor: "pointer" },
  // Formulario
  formOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  formCard: { background: "#0d1424", borderRadius: 20, padding: "1.75rem", width: "100%", maxWidth: 540, border: "1px solid rgba(148,163,184,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" },
  formHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  formHeaderLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  formIconBadge: { width: 42, height: 42, borderRadius: 12, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" },
  formTitle: { fontSize: "1rem", fontWeight: 700, color: "#e8eaf0", margin: 0 },
  formSubtitle: { fontSize: "0.75rem", color: "#4d5a80", margin: 0, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#5a6080", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" },
  formField: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "0.7rem", fontWeight: 600, color: "#4d6080", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { background: "#080d18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e8eaf0", fontSize: "0.9rem", padding: "0.65rem 0.85rem", outline: "none", width: "100%", boxSizing: "border-box" },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", color: "#3a4a6a", fontSize: "0.85rem", pointerEvents: "none" },
  durationWrap: { display: "flex", alignItems: "center", gap: "0.5rem", background: "#080d18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "0.5rem 0.85rem" },
  durationPart: { display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 },
  durationInput: { background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: "1.05rem", fontWeight: 600, width: "3rem", textAlign: "center", fontVariantNumeric: "tabular-nums" },
  durationUnit: { fontSize: "0.72rem", color: "#3a4a6a", textTransform: "uppercase", fontWeight: 600 },
  durationSep: { fontSize: "1.2rem", fontWeight: 700, color: "#2a3550", padding: "0 0.25rem" },
  cardRow: { display: "flex", gap: "0.5rem" },
  diffCard: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "0.6rem 0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#4d5a80", cursor: "pointer" },
  statusCard: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.65rem 0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#4d5a80", cursor: "pointer" },
  formError: { display: "flex", alignItems: "center", gap: "0.4rem", color: "#ef4444", fontSize: "0.82rem", marginBottom: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.6rem 0.85rem" },
  formActions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end" },
  cancelBtn: { padding: "0.65rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#7a82a8", fontSize: "0.88rem", cursor: "pointer" },
  submitBtn: { padding: "0.65rem 1.5rem", background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", borderRadius: 10, color: "white", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  spinner: { width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
};
