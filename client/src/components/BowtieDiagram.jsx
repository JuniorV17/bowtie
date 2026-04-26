// client/src/components/BowtieDiagram.jsx
// Diagrama Bowtie Profesional - Diseño para presentaciones oficiales
import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import jsPDF from "jspdf";

const FONT = "Arial, Helvetica, sans-serif";

// Componente de notificación toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: bgColor,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: FONT,
      fontSize: '14px',
      fontWeight: '500',
    }}>
      <span style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>{icon}</span>
      {message}
    </div>
  );
};

// Colores profesionales
const THEME = {
  causeBg: "#E0E7FF",
  causeStroke: "#4338CA",
  causeText: "#312E81",

  conseBg: "#FFEDD5",
  conseStroke: "#C2410C",
  conseText: "#7C2D12",

  centerBg: "#FEF3C7",
  centerStroke: "#B45309",
  centerText: "#78350F",

  prevBg: "#D1FAE5",
  prevStroke: "#047857",
  prevText: "#064E3B",

  mitiBg: "#FDE68A",
  mitiStroke: "#B45309",
  mitiText: "#78350F",

  // Escalation colors (warning style)
  escalationBg: "#FEE2E2",
  escalationStroke: "#DC2626",
  escalationText: "#991B1B",

  zoneCause: "#EEF2FF",
  zoneConse: "#FFF7ED",
  line: "#64748B",
  bg: "#FFFFFF",
};

// Componente de texto SVG con wrap automático
const SvgText = React.memo(({ x, y, text, width, size, color, bold, maxLines = 3 }) => {
  const words = (text || "").split(" ");
  const charWidth = size * 0.55;
  const maxChars = Math.floor(width / charWidth);

  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    if (word.length > maxChars) {
      if (currentLine) lines.push(currentLine);
      lines.push(word.slice(0, maxChars - 1) + "…");
      currentLine = "";
    } else if ((currentLine + " " + word).trim().length <= maxChars) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    const last = displayLines[maxLines - 1];
    displayLines[maxLines - 1] = last.slice(0, -1) + "…";
  }

  const lineHeight = size * 1.2;
  const totalHeight = displayLines.length * lineHeight;
  const startY = y - totalHeight / 2 + lineHeight / 2;

  return (
    <g>
      {displayLines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={startY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size}
          fontFamily={FONT}
          fontWeight={bold ? "700" : "500"}
          fill={color}
        >
          {line}
        </text>
      ))}
    </g>
  );
});

const BowtieDiagram = ({ data, apiData }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });
  const [toast, setToast] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animación de entrada
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 100),
      setTimeout(() => setAnimationPhase(2), 300),
      setTimeout(() => setAnimationPhase(3), 500),
      setTimeout(() => setAnimationPhase(4), 700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Observar tamaño del contenedor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth || 1200,
        height: container.clientHeight || 800
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Transformar datos
  const diagram = useMemo(() => {
    if (apiData) {
      return {
        title: apiData.title || "",
        risk: apiData.riskName || "",
        topEvent: apiData.topEvent || "",
        evaluations: apiData.evaluations || [],
        causes: (apiData.causes || []).map(c => ({
          id: c.id,
          label: c.label,
          controls: (c.controls || []).map(ctrl => ({
            id: ctrl.id,
            label: ctrl.label,
            escalations: ctrl.escalations || []
          }))
        })),
        consequences: (apiData.consequences || []).map(c => ({
          id: c.id,
          label: c.label,
          mitigations: (c.mitigations || []).map(m => ({
            id: m.id,
            label: m.label,
            escalations: m.escalations || []
          }))
        }))
      };
    }
    if (data) {
      return {
        title: data.titulo || "",
        risk: data.riesgo || "",
        topEvent: data.topEvent || "",
        evaluations: [],
        causes: (data.causas || []).map(c => ({
          id: c.id,
          label: c.label,
          controls: (data.controles || []).filter(ctrl => ctrl.parent === c.id).map(ctrl => ({
            ...ctrl,
            escalations: ctrl.escalations || []
          }))
        })),
        consequences: (data.consecuencias || []).map(c => ({
          id: c.id,
          label: c.label,
          mitigations: (data.mitigaciones || []).filter(m => m.parent === c.id).map(m => ({
            ...m,
            escalations: m.escalations || []
          }))
        }))
      };
    }
    return null;
  }, [data, apiData]);

  // Calcular layout completo
  const layout = useMemo(() => {
    if (!diagram) return null;

    const { causes, consequences } = diagram;
    const nCauses = Math.max(causes.length, 1);
    const nConseq = Math.max(consequences.length, 1);
    const maxRows = Math.max(nCauses, nConseq);

    // Contar barreras
    const maxCtrls = Math.max(1, ...causes.map(c => c.controls.length));
    const maxMits = Math.max(1, ...consequences.map(c => c.mitigations.length));

    // Contar escalamientos
    const hasEscalations = causes.some(c => c.controls.some(ctrl => ctrl.escalations?.length > 0)) ||
                          consequences.some(c => c.mitigations.some(m => m.escalations?.length > 0));

    // DIMENSIONES MÁS GRANDES para usar más espacio horizontal
    const baseNodeW = 200;      // Más ancho
    const baseNodeH = 70;       // Más alto
    const baseBarrierW = 110;   // Barreras más anchas
    const baseBarrierH = 48;    // Barreras más altas
    const centerR = 90;         // Centro más grande
    const escalationW = 90;     // Ancho de nodo de escalamiento
    const escalationH = 36;     // Alto de nodo de escalamiento

    // Espaciado vertical por fila - más generoso
    const rowH = Math.max(baseNodeH + 50, (Math.max(maxCtrls, maxMits) * (baseBarrierH + 14)));

    // Dimensiones del SVG - usar casi todo el ancho disponible
    const padding = 40;
    const headerH = 80;
    const footerH = 50;

    // Calcular ancho - usar mucho más espacio horizontal
    const barrierColW = baseBarrierW + 25;
    const ctrlCols = Math.ceil(maxCtrls / Math.min(maxCtrls, 3)); // Max 3 por columna para más espacio
    const mitiCols = Math.ceil(maxMits / Math.min(maxMits, 3));

    const leftSectionW = baseNodeW + 60 + ctrlCols * barrierColW + 80;
    const rightSectionW = baseNodeW + 60 + mitiCols * barrierColW + 80;
    const centerW = centerR * 2 + 150;

    // Ancho mínimo mucho mayor para usar todo el espacio
    const W = Math.max(1800, padding * 2 + leftSectionW + centerW + rightSectionW);
    const H = Math.max(900, headerH + maxRows * rowH + footerH + padding + 200);

    const CX = W / 2;
    const CY = headerH + 80 + (maxRows * rowH) / 2;

    // Posiciones de nodos (distribuidos verticalmente)
    const getYPositions = (count) => {
      if (count === 1) return [CY];
      const totalH = (count - 1) * rowH;
      const startY = CY - totalH / 2;
      return Array.from({ length: count }, (_, i) => startY + i * rowH);
    };

    const causeYs = getYPositions(nCauses);
    const conseqYs = getYPositions(nConseq);

    // Posicionar causas - más hacia la izquierda
    const causeX = padding + baseNodeW / 2 + 30;
    const positionedCauses = causes.map((c, i) => ({
      ...c,
      x: causeX,
      y: causeYs[i],
      w: baseNodeW,
      h: baseNodeH
    }));

    // Posicionar consecuencias - más hacia la derecha
    const conseqX = W - padding - baseNodeW / 2 - 30;
    const positionedConseqs = consequences.map((c, i) => ({
      ...c,
      x: conseqX,
      y: conseqYs[i],
      w: baseNodeW,
      h: baseNodeH
    }));

    // Posicionar controles (en columnas junto a cada causa)
    const controls = [];
    const ctrlStartX = causeX + baseNodeW / 2 + 50;

    positionedCauses.forEach(cause => {
      const ctrls = cause.controls;
      const n = ctrls.length;
      if (n === 0) return;

      // Distribuir en columnas de max 3 para más espacio
      const maxPerCol = Math.min(3, n);
      const numCols = Math.ceil(n / maxPerCol);

      ctrls.forEach((ctrl, idx) => {
        const col = Math.floor(idx / maxPerCol);
        const row = idx % maxPerCol;
        const itemsInCol = Math.min(maxPerCol, n - col * maxPerCol);

        const colH = itemsInCol * (baseBarrierH + 12) - 12;
        const startY = cause.y - colH / 2;

        controls.push({
          ...ctrl,
          x: ctrlStartX + col * (baseBarrierW + 20) + baseBarrierW / 2,
          y: startY + row * (baseBarrierH + 12) + baseBarrierH / 2,
          w: baseBarrierW,
          h: baseBarrierH,
          parentId: cause.id,
          parentY: cause.y
        });
      });
    });

    // Posicionar mitigaciones (en columnas junto a cada consecuencia)
    const mitigations = [];
    const mitiStartX = conseqX - baseNodeW / 2 - 50;

    positionedConseqs.forEach(conseq => {
      const mits = conseq.mitigations;
      const n = mits.length;
      if (n === 0) return;

      const maxPerCol = Math.min(3, n);
      const numCols = Math.ceil(n / maxPerCol);

      mits.forEach((mit, idx) => {
        const col = Math.floor(idx / maxPerCol);
        const row = idx % maxPerCol;
        const itemsInCol = Math.min(maxPerCol, n - col * maxPerCol);

        const colH = itemsInCol * (baseBarrierH + 12) - 12;
        const startY = conseq.y - colH / 2;

        mitigations.push({
          ...mit,
          x: mitiStartX - col * (baseBarrierW + 20) - baseBarrierW / 2,
          y: startY + row * (baseBarrierH + 12) + baseBarrierH / 2,
          w: baseBarrierW,
          h: baseBarrierH,
          parentId: conseq.id,
          parentY: conseq.y
        });
      });
    });

    // Calcular límites reales de todos los elementos para el bowtie
    const allLeftElements = [...positionedCauses, ...controls];
    const allRightElements = [...positionedConseqs, ...mitigations];
    const allElements = [...allLeftElements, ...allRightElements];

    // Encontrar los límites de TODOS los elementos
    const leftMinX = allLeftElements.length > 0
      ? Math.min(...allLeftElements.map(e => e.x - (e.w || baseBarrierW) / 2))
      : padding;
    const leftMaxX = allLeftElements.length > 0
      ? Math.max(...allLeftElements.map(e => e.x + (e.w || baseBarrierW) / 2))
      : CX - centerR - 50;
    const rightMinX = allRightElements.length > 0
      ? Math.min(...allRightElements.map(e => e.x - (e.w || baseBarrierW) / 2))
      : CX + centerR + 50;
    const rightMaxX = allRightElements.length > 0
      ? Math.max(...allRightElements.map(e => e.x + (e.w || baseBarrierW) / 2))
      : W - padding;

    const allMinY = allElements.length > 0
      ? Math.min(...allElements.map(e => e.y - (e.h || baseBarrierH) / 2))
      : CY - 100;
    const allMaxY = allElements.length > 0
      ? Math.max(...allElements.map(e => e.y + (e.h || baseBarrierH) / 2))
      : CY + 100;

    // Bordes del bowtie con margen generoso
    const margin = 50;
    const bowtieLeftX = leftMinX - margin;
    const bowtieRightX = rightMaxX + margin;

    // Puntos de transición: donde termina la parte horizontal y empieza la diagonal
    // Estos son los límites X más cercanos al centro de cada lado
    const leftTransitionX = leftMaxX + 30;  // Punto donde termina la zona de elementos izquierda
    const rightTransitionX = rightMinX - 30; // Punto donde termina la zona de elementos derecha

    // Bordes verticales del bowtie: cubren todos los elementos con margen
    const bowtieTopY = allMinY - margin;
    const bowtieBotY = allMaxY + margin;

    // Puntos centrales donde se unen las dos mitades
    const centerTopY = CY - centerR - 20;
    const centerBotY = CY + centerR + 20;

    // Líneas de conexión
    const lines = [];

    // Líneas de causas -> controles -> centro
    positionedCauses.forEach(cause => {
      const causeCtrls = controls.filter(c => c.parentId === cause.id);

      if (causeCtrls.length > 0) {
        // Línea desde causa hasta primera columna de controles
        const firstCtrl = causeCtrls[0];
        lines.push({
          x1: cause.x + baseNodeW / 2,
          y1: cause.y,
          x2: firstCtrl.x - baseBarrierW / 2 - 8,
          y2: cause.y,
          color: THEME.causeStroke,
          width: 2.5
        });

        // Línea desde última columna de controles hasta centro
        const lastCtrlX = Math.max(...causeCtrls.map(c => c.x + baseBarrierW / 2));
        lines.push({
          x1: lastCtrlX + 8,
          y1: cause.y,
          x2: CX - centerR,
          y2: CY,
          color: THEME.causeStroke,
          width: 3
        });
      } else {
        // Línea directa desde causa al centro
        lines.push({
          x1: cause.x + baseNodeW / 2,
          y1: cause.y,
          x2: CX - centerR,
          y2: CY,
          color: THEME.causeStroke,
          width: 3
        });
      }
    });

    // Líneas de centro -> mitigaciones -> consecuencias
    positionedConseqs.forEach(conseq => {
      const conseqMits = mitigations.filter(m => m.parentId === conseq.id);

      if (conseqMits.length > 0) {
        // Línea desde centro hasta primera columna de mitigaciones
        const lastMitX = Math.min(...conseqMits.map(m => m.x - baseBarrierW / 2));
        lines.push({
          x1: CX + centerR,
          y1: CY,
          x2: lastMitX - 8,
          y2: conseq.y,
          color: THEME.conseStroke,
          width: 3
        });

        // Línea desde mitigaciones hasta consecuencia
        const firstMit = conseqMits[0];
        lines.push({
          x1: firstMit.x + baseBarrierW / 2 + 8,
          y1: conseq.y,
          x2: conseq.x - baseNodeW / 2,
          y2: conseq.y,
          color: THEME.conseStroke,
          width: 2.5
        });
      } else {
        // Línea directa desde centro a consecuencia
        lines.push({
          x1: CX + centerR,
          y1: CY,
          x2: conseq.x - baseNodeW / 2,
          y2: conseq.y,
          color: THEME.conseStroke,
          width: 3
        });
      }
    });

    // Position escalation nodes
    const controlEscalations = [];
    controls.forEach((ctrl) => {
      if (ctrl.escalations && ctrl.escalations.length > 0) {
        ctrl.escalations.forEach((esc, idx) => {
          controlEscalations.push({
            ...esc,
            x: ctrl.x,
            y: ctrl.y - ctrl.h / 2 - 20 - (idx * (escalationH + 8)) - escalationH / 2,
            w: escalationW,
            h: escalationH,
            parentX: ctrl.x,
            parentY: ctrl.y - ctrl.h / 2,
          });
        });
      }
    });

    const mitigationEscalations = [];
    mitigations.forEach((mit) => {
      if (mit.escalations && mit.escalations.length > 0) {
        mit.escalations.forEach((esc, idx) => {
          mitigationEscalations.push({
            ...esc,
            x: mit.x,
            y: mit.y - mit.h / 2 - 20 - (idx * (escalationH + 8)) - escalationH / 2,
            w: escalationW,
            h: escalationH,
            parentX: mit.x,
            parentY: mit.y - mit.h / 2,
          });
        });
      }
    });

    return {
      W,
      H,
      CX,
      CY,
      centerR,
      bowtieTop: bowtieTopY,
      bowtieBot: bowtieBotY,
      bowtieLeft: bowtieLeftX,
      bowtieRight: bowtieRightX,
      leftTransitionX,
      rightTransitionX,
      centerTopY,
      centerBotY,
      causes: positionedCauses,
      consequences: positionedConseqs,
      controls,
      mitigations,
      controlEscalations,
      mitigationEscalations,
      lines
    };
  }, [diagram]);

  // Exportar PDF con centrado y notificación
  const exportPDF = useCallback(async () => {
    if (!svgRef.current || !layout || isExporting || !diagram) return;

    setIsExporting(true);
    showToast('Generando PDF...', 'info');

    const { W, H } = layout;
    const clone = svgRef.current.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Remover clases de animación para el export
    clone.querySelectorAll('[style*="animation"]').forEach(el => {
      el.style.animation = 'none';
      el.style.opacity = '1';
    });

    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `text { font-family: ${FONT}; }`;
    clone.insertBefore(style, clone.firstChild);

    // Preparar datos para el panel de información
    const beforeEval = diagram.evaluations?.find(e => e.evaluation_type === 'before');
    const afterEval = diagram.evaluations?.find(e => e.evaluation_type === 'after');
    const allEscalations = [
      ...layout.controlEscalations.map(e => ({ ...e, type: 'control' })),
      ...layout.mitigationEscalations.map(e => ({ ...e, type: 'mitigation' }))
    ];
    const hasEvaluations = beforeEval || afterEval;
    const hasEscalations = allEscalations.length > 0;

    // Calcular altura del panel de info
    const infoPanelHeight = (hasEvaluations || hasEscalations) ? 180 : 0;

    // Margen para centrado en página
    const pageMargin = 40;
    const pageW = W + pageMargin * 2;
    const pageH = H + pageMargin * 2 + infoPanelHeight;

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = pageW * scale;
    canvas.height = pageH * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.scale(scale, scale);
      // Dibujar diagrama centrado
      ctx.drawImage(img, pageMargin, pageMargin, W, H);
      URL.revokeObjectURL(url);

      // Helper para dibujar rectángulos redondeados
      const drawRoundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      // Dibujar panel de información
      if (hasEvaluations || hasEscalations) {
        const infoY = pageMargin + H + 20;
        const cardWidth = (pageW - pageMargin * 2 - 20) / 2;

        // Línea separadora
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pageMargin, infoY - 10);
        ctx.lineTo(pageW - pageMargin, infoY - 10);
        ctx.stroke();

        // Panel de Evaluaciones SMS
        if (hasEvaluations) {
          const evalX = pageMargin;

          // Título de sección
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#374151';
          ctx.fillText('📊 Evaluación de Riesgo SMS', evalX, infoY + 10);

          // Evaluación Antes
          if (beforeEval) {
            const boxX = evalX;
            const boxY = infoY + 25;
            const boxW = cardWidth / 2 - 10;
            const boxH = 100;

            // Color según tolerabilidad
            const colors = {
              'Aceptable': { bg: '#DCFCE7', border: '#22C55E', text: '#166534' },
              'Tolerable': { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E' },
              'Intolerable': { bg: '#FFEDD5', border: '#F97316', text: '#9A3412' },
              'Inaceptable': { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
            };
            const c = colors[beforeEval.tolerability] || colors['Tolerable'];

            ctx.fillStyle = c.bg;
            ctx.strokeStyle = c.border;
            ctx.lineWidth = 2;
            drawRoundRect(boxX, boxY, boxW, boxH, 8);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#3B82F6';
            ctx.fillText('⚠️ RIESGO INICIAL', boxX + 10, boxY + 18);

            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = c.text;
            ctx.fillText(beforeEval.tolerability, boxX + 10, boxY + 45);

            ctx.font = '11px Arial';
            ctx.fillStyle = '#6B7280';
            ctx.fillText(`Probabilidad: ${beforeEval.probability}`, boxX + 10, boxY + 65);
            ctx.fillText(`Gravedad: ${beforeEval.severity}`, boxX + 10, boxY + 80);
          }

          // Evaluación Después
          if (afterEval) {
            const boxX = evalX + cardWidth / 2;
            const boxY = infoY + 25;
            const boxW = cardWidth / 2 - 10;
            const boxH = 100;

            const colors = {
              'Aceptable': { bg: '#DCFCE7', border: '#22C55E', text: '#166534' },
              'Tolerable': { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E' },
              'Intolerable': { bg: '#FFEDD5', border: '#F97316', text: '#9A3412' },
              'Inaceptable': { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
            };
            const c = colors[afterEval.tolerability] || colors['Tolerable'];

            ctx.fillStyle = c.bg;
            ctx.strokeStyle = c.border;
            ctx.lineWidth = 2;
            drawRoundRect(boxX, boxY, boxW, boxH, 8);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#059669';
            ctx.fillText('🛡️ RIESGO RESIDUAL', boxX + 10, boxY + 18);

            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = c.text;
            ctx.fillText(afterEval.tolerability, boxX + 10, boxY + 45);

            ctx.font = '11px Arial';
            ctx.fillStyle = '#6B7280';
            ctx.fillText(`Probabilidad: ${afterEval.probability}`, boxX + 10, boxY + 65);
            ctx.fillText(`Gravedad: ${afterEval.severity}`, boxX + 10, boxY + 80);
          }
        }

        // Panel de Escalamientos
        if (hasEscalations) {
          const escX = hasEvaluations ? pageMargin + cardWidth + 20 : pageMargin;
          const escWidth = hasEvaluations ? cardWidth : pageW - pageMargin * 2;

          // Título de sección
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#374151';
          ctx.fillText(`⚡ Factores de Escalamiento (${allEscalations.length})`, escX, infoY + 10);

          // Fondo del panel
          ctx.fillStyle = '#FEF2F2';
          ctx.strokeStyle = '#FECACA';
          ctx.lineWidth = 1;
          drawRoundRect(escX, infoY + 25, escWidth, 100, 8);
          ctx.fill();
          ctx.stroke();

          // Lista de escalamientos
          ctx.font = '11px Arial';
          let escY = infoY + 45;
          const maxItems = 5;
          allEscalations.slice(0, maxItems).forEach((esc, idx) => {
            ctx.fillStyle = '#991B1B';
            const icon = esc.type === 'control' ? '🛡️→' : '⚠️→';
            const text = `${icon} ${esc.label}`;
            const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
            ctx.fillText(truncated, escX + 12, escY + idx * 16);
          });

          if (allEscalations.length > maxItems) {
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText(`... y ${allEscalations.length - maxItems} más`, escX + 12, escY + maxItems * 16);
          }
        }
      }

      const pdf = new jsPDF({
        orientation: pageW > pageH ? "landscape" : "portrait",
        unit: "pt",
        format: [pageW, pageH]
      });
      pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, pageW, pageH);
      pdf.save(`diagrama-bowtie${diagram.title ? '-' + diagram.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() : ''}.pdf`);

      setIsExporting(false);
      showToast('PDF descargado exitosamente', 'success');
    };

    img.onerror = () => {
      setIsExporting(false);
      showToast('Error al generar PDF', 'error');
    };

    img.src = url;
  }, [layout, diagram, isExporting, showToast]);

  // Descargar SVG con centrado y notificación
  const downloadSVG = useCallback(() => {
    if (!svgRef.current || isExporting) return;

    setIsExporting(true);
    showToast('Generando SVG...', 'info');

    try {
      const { W, H } = layout;
      const margin = 40;

      // Crear SVG contenedor con margen
      const wrapperSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      wrapperSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      wrapperSvg.setAttribute("width", W + margin * 2);
      wrapperSvg.setAttribute("height", H + margin * 2);
      wrapperSvg.setAttribute("viewBox", `0 0 ${W + margin * 2} ${H + margin * 2}`);

      // Fondo blanco
      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "#FFFFFF");
      wrapperSvg.appendChild(bgRect);

      // Grupo para centrar el contenido
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${margin}, ${margin})`);

      // Clonar contenido del SVG original
      const clone = svgRef.current.cloneNode(true);
      Array.from(clone.childNodes).forEach(child => {
        g.appendChild(child.cloneNode(true));
      });

      wrapperSvg.appendChild(g);

      const blob = new Blob([new XMLSerializer().serializeToString(wrapperSvg)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagrama-bowtie.svg";
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsExporting(false);
        showToast('SVG descargado exitosamente', 'success');
      }, 500);
    } catch (err) {
      setIsExporting(false);
      showToast('Error al generar SVG', 'error');
    }
  }, [layout, isExporting, showToast]);

  // Ajustar zoom al tamaño del contenedor
  const fitToScreen = useCallback(() => {
    if (!layout || !containerRef.current) return;
    const { W, H } = layout;
    const container = containerRef.current;
    const scaleX = (container.clientWidth - 20) / W;
    const scaleY = (container.clientHeight - 20) / H;
    setZoom(Math.min(scaleX, scaleY, 1));
  }, [layout]);

  useEffect(() => {
    fitToScreen();
  }, [fitToScreen, containerSize]);

  if (!diagram || !layout) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#666", fontFamily: FONT }}>
        No hay datos para mostrar
      </div>
    );
  }

  const { W, H, CX, CY, centerR, bowtieTop, bowtieBot, bowtieLeft, bowtieRight, leftTransitionX, rightTransitionX, centerTopY, centerBotY, causes, consequences, controls, mitigations, controlEscalations, mitigationEscalations, lines } = layout;

  // CSS Animations
  const animationStyles = `
    @keyframes slideInUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes drawLine {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 3px rgba(79, 70, 229, 0.3)); }
      50% { filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.6)); }
    }
    .btn-primary {
      transition: all 0.2s ease;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }
    .btn-secondary {
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background-color: #CBD5E1;
      transform: translateY(-1px);
    }
    .legend-item {
      transition: all 0.2s ease;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .legend-item:hover {
      background-color: #F1F5F9;
      transform: scale(1.05);
    }
  `;

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F8FAFC", fontFamily: FONT }}>
      <style>{animationStyles}</style>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header con gradiente sutil */}
      <div style={{
        padding: "12px 24px",
        background: "linear-gradient(to right, #FFFFFF, #F8FAFC)",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)"
          }}>
            <span style={{ color: "#FFF", fontSize: 18 }}>⬡</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Diagrama Bowtie</h1>
            <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>Análisis de Riesgos Profesional</p>
          </div>
        </div>

        {/* Leyenda con animación */}
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#475569", flexWrap: "wrap" }}>
          {[
            { bg: THEME.causeBg, stroke: THEME.causeStroke, label: "Amenaza", radius: "4px" },
            { bg: THEME.prevBg, stroke: THEME.prevStroke, label: "Control", radius: "4px" },
            { bg: THEME.centerBg, stroke: THEME.centerStroke, label: "Evento Central", radius: "50%" },
            { bg: THEME.mitiBg, stroke: THEME.mitiStroke, label: "Mitigación", radius: "4px" },
            { bg: THEME.conseBg, stroke: THEME.conseStroke, label: "Consecuencia", radius: "4px" },
            { bg: THEME.escalationBg, stroke: THEME.escalationStroke, label: "Escalamiento", radius: "4px", dashed: true },
          ].map((item, i) => (
            <span key={i} className="legend-item" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}>
              <span style={{
                width: 14,
                height: 14,
                borderRadius: item.radius,
                backgroundColor: item.bg,
                border: `2px ${item.dashed ? 'dashed' : 'solid'} ${item.stroke}`,
                transition: "transform 0.2s"
              }}/>
              {item.label}
            </span>
          ))}
        </div>

        {/* Controles mejorados */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={fitToScreen}
            className="btn-secondary"
            style={{
              padding: "8px 14px",
              backgroundColor: "#F1F5F9",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>⊡</span> Ajustar
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <button
              onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
              className="btn-secondary"
              style={{ border: "none", background: "none", cursor: "pointer", padding: "8px 12px", fontSize: 16, fontWeight: 500 }}
            >−</button>
            <span style={{ fontSize: 12, width: 50, textAlign: "center", color: "#475569", fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="btn-secondary"
              style={{ border: "none", background: "none", cursor: "pointer", padding: "8px 12px", fontSize: 16, fontWeight: 500 }}
            >+</button>
          </div>

          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="btn-primary"
            style={{
              padding: "8px 18px",
              color: "#FFF",
              border: "none",
              borderRadius: 8,
              cursor: isExporting ? "wait" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: isExporting ? 0.7 : 1
            }}
          >
            <span>📄</span> PDF
          </button>

          <button
            onClick={downloadSVG}
            disabled={isExporting}
            className="btn-secondary"
            style={{
              padding: "8px 18px",
              backgroundColor: "#E2E8F0",
              color: "#334155",
              border: "none",
              borderRadius: 8,
              cursor: isExporting ? "wait" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: isExporting ? 0.7 : 1
            }}
          >
            <span>🖼️</span> SVG
          </button>
        </div>
      </div>

      {/* Contenedor del diagrama con fondo mejorado */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: zoom < 1 ? "center" : "flex-start",
          padding: 20
        }}
      >
        <div style={{
          width: W * zoom,
          height: H * zoom,
          flexShrink: 0,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <svg
            ref={svgRef}
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{
              display: "block",
              transform: `scale(${zoom})`,
              transformOrigin: "top left"
            }}
          >
            {/* Fondo con gradiente sutil */}
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FAFBFC" />
              </linearGradient>
              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
              </filter>
            </defs>
            <rect width={W} height={H} fill="url(#bgGradient)" />

            {/* Forma de Bowtie - Lado izquierdo con animación */}
            <path
              d={`M ${bowtieLeft},${bowtieTop}
                  L ${leftTransitionX},${bowtieTop}
                  L ${CX},${centerTopY}
                  L ${CX},${centerBotY}
                  L ${leftTransitionX},${bowtieBot}
                  L ${bowtieLeft},${bowtieBot} Z`}
              fill={THEME.zoneCause}
              stroke={THEME.causeStroke}
              strokeWidth={2}
              strokeOpacity={0.5}
              style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transition: "opacity 0.5s ease"
              }}
            />

            {/* Forma de Bowtie - Lado derecho */}
            <path
              d={`M ${bowtieRight},${bowtieTop}
                  L ${rightTransitionX},${bowtieTop}
                  L ${CX},${centerTopY}
                  L ${CX},${centerBotY}
                  L ${rightTransitionX},${bowtieBot}
                  L ${bowtieRight},${bowtieBot} Z`}
              fill={THEME.zoneConse}
              stroke={THEME.conseStroke}
              strokeWidth={2}
              strokeOpacity={0.5}
              style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transition: "opacity 0.5s ease 0.1s"
              }}
            />

            {/* Etiquetas de zona con animación */}
            <text
              x={bowtieLeft + 20}
              y={bowtieBot + 35}
              fontSize={18}
              fontWeight="700"
              fill={THEME.causeStroke}
              fontFamily={FONT}
              style={{ opacity: animationPhase >= 2 ? 1 : 0, transition: "opacity 0.4s ease" }}
            >
              AMENAZAS
            </text>
            <text
              x={bowtieRight - 20}
              y={bowtieBot + 35}
              fontSize={18}
              fontWeight="700"
              fill={THEME.conseStroke}
              fontFamily={FONT}
              textAnchor="end"
              style={{ opacity: animationPhase >= 2 ? 1 : 0, transition: "opacity 0.4s ease" }}
            >
              CONSECUENCIAS
            </text>

            {/* Caja de Riesgo con sombra y animación */}
            <g style={{ opacity: animationPhase >= 1 ? 1 : 0, transition: "opacity 0.5s ease" }} filter="url(#dropShadow)">
              <rect x={CX - 280} y={12} width={560} height={50} rx={12} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={2} />
              <text x={CX} y={42} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight="700" fill="#1E293B" fontFamily={FONT}>
                PELIGRO: {diagram.risk}
              </text>
            </g>

            {/* Líneas de conexión con animación */}
            <g style={{ opacity: animationPhase >= 2 ? 1 : 0, transition: "opacity 0.6s ease" }}>
              {lines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.color}
                  strokeWidth={line.width}
                  strokeLinecap="round"
                  strokeOpacity={0.8}
                />
              ))}
            </g>

            {/* Círculo central con efecto de brillo */}
            <g
              style={{
                opacity: animationPhase >= 2 ? 1 : 0,
                transform: animationPhase >= 2 ? 'scale(1)' : 'scale(0.8)',
                transformOrigin: `${CX}px ${CY}px`,
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
              filter="url(#dropShadow)"
            >
              <circle cx={CX} cy={CY} r={centerR + 3} fill="rgba(180, 83, 9, 0.1)" />
              <circle cx={CX} cy={CY} r={centerR} fill={THEME.centerBg} stroke={THEME.centerStroke} strokeWidth={4} />
              <SvgText x={CX} y={CY} text={diagram.topEvent} width={centerR * 1.6} size={14} color={THEME.centerText} bold />
            </g>

            {/* Nodos de Causas con animación escalonada */}
            {causes.map((c, idx) => (
              <g
                key={c.id}
                style={{
                  opacity: animationPhase >= 3 ? 1 : 0,
                  transform: animationPhase >= 3 ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `all 0.4s ease ${idx * 0.1}s`,
                  cursor: 'pointer'
                }}
                filter="url(#dropShadow)"
                onMouseEnter={() => setHoveredElement(`cause-${c.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <rect
                  x={c.x - c.w / 2}
                  y={c.y - c.h / 2}
                  width={c.w}
                  height={c.h}
                  rx={10}
                  fill={THEME.causeBg}
                  stroke={THEME.causeStroke}
                  strokeWidth={hoveredElement === `cause-${c.id}` ? 3.5 : 2.5}
                  style={{ transition: 'stroke-width 0.2s' }}
                />
                <SvgText x={c.x} y={c.y} text={c.label} width={c.w - 20} size={13} color={THEME.causeText} />
              </g>
            ))}

            {/* Nodos de Consecuencias con animación escalonada */}
            {consequences.map((c, idx) => (
              <g
                key={c.id}
                style={{
                  opacity: animationPhase >= 3 ? 1 : 0,
                  transform: animationPhase >= 3 ? 'translateX(0)' : 'translateX(20px)',
                  transition: `all 0.4s ease ${idx * 0.1}s`,
                  cursor: 'pointer'
                }}
                filter="url(#dropShadow)"
                onMouseEnter={() => setHoveredElement(`conseq-${c.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <rect
                  x={c.x - c.w / 2}
                  y={c.y - c.h / 2}
                  width={c.w}
                  height={c.h}
                  rx={10}
                  fill={THEME.conseBg}
                  stroke={THEME.conseStroke}
                  strokeWidth={hoveredElement === `conseq-${c.id}` ? 3.5 : 2.5}
                  style={{ transition: 'stroke-width 0.2s' }}
                />
                <SvgText x={c.x} y={c.y} text={c.label} width={c.w - 20} size={13} color={THEME.conseText} />
              </g>
            ))}

            {/* Controles Preventivos con animación */}
            {controls.map((c, i) => (
              <g
                key={`ctrl-${c.id}-${i}`}
                style={{
                  opacity: animationPhase >= 4 ? 1 : 0,
                  transform: animationPhase >= 4 ? 'scale(1)' : 'scale(0.9)',
                  transformOrigin: `${c.x}px ${c.y}px`,
                  transition: `all 0.3s ease ${i * 0.05}s`,
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredElement(`ctrl-${c.id}-${i}`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <rect
                  x={c.x - c.w / 2}
                  y={c.y - c.h / 2}
                  width={c.w}
                  height={c.h}
                  rx={6}
                  fill={THEME.prevBg}
                  stroke={THEME.prevStroke}
                  strokeWidth={hoveredElement === `ctrl-${c.id}-${i}` ? 3 : 2}
                  style={{ transition: 'stroke-width 0.2s' }}
                />
                <SvgText x={c.x} y={c.y} text={c.label} width={c.w - 14} size={11} color={THEME.prevText} maxLines={2} />
              </g>
            ))}

            {/* Mitigaciones con animación */}
            {mitigations.map((m, i) => {
              const hasEscalations = m.escalations && m.escalations.length > 0;
              return (
                <g
                  key={`mit-${m.id}-${i}`}
                  style={{
                    opacity: animationPhase >= 4 ? 1 : 0,
                    transform: animationPhase >= 4 ? 'scale(1)' : 'scale(0.9)',
                    transformOrigin: `${m.x}px ${m.y}px`,
                    transition: `all 0.3s ease ${i * 0.05}s`,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredElement(`mit-${m.id}-${i}`)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <rect
                    x={m.x - m.w / 2}
                    y={m.y - m.h / 2}
                    width={m.w}
                    height={m.h}
                    rx={6}
                    fill={THEME.mitiBg}
                    stroke={THEME.mitiStroke}
                    strokeWidth={hoveredElement === `mit-${m.id}-${i}` ? 3 : 2}
                    style={{ transition: 'stroke-width 0.2s' }}
                  />
                  <SvgText x={m.x} y={m.y} text={m.label} width={m.w - 14} size={11} color={THEME.mitiText} maxLines={2} />
                </g>
              );
            })}

            {/* Control Escalations - Visual nodes */}
            {controlEscalations.map((esc, i) => (
              <g
                key={`ctrl-esc-${esc.id}-${i}`}
                style={{
                  opacity: animationPhase >= 4 ? 1 : 0,
                  transition: `all 0.4s ease ${0.8 + i * 0.05}s`,
                }}
              >
                {/* Connection line */}
                <line
                  x1={esc.parentX}
                  y1={esc.parentY}
                  x2={esc.x}
                  y2={esc.y + esc.h / 2}
                  stroke={THEME.escalationStroke}
                  strokeWidth={2}
                  strokeDasharray="4,3"
                  opacity={0.7}
                />
                {/* Escalation node */}
                <rect
                  x={esc.x - esc.w / 2}
                  y={esc.y - esc.h / 2}
                  width={esc.w}
                  height={esc.h}
                  rx={5}
                  fill={THEME.escalationBg}
                  stroke={THEME.escalationStroke}
                  strokeWidth={2}
                />
                {/* Lightning icon */}
                <text
                  x={esc.x - esc.w / 2 + 12}
                  y={esc.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                >
                  ⚡
                </text>
                <SvgText
                  x={esc.x + 6}
                  y={esc.y}
                  text={esc.label}
                  width={esc.w - 28}
                  size={9}
                  color={THEME.escalationText}
                  maxLines={2}
                />
              </g>
            ))}

            {/* Mitigation Escalations - Visual nodes */}
            {mitigationEscalations.map((esc, i) => (
              <g
                key={`mit-esc-${esc.id}-${i}`}
                style={{
                  opacity: animationPhase >= 4 ? 1 : 0,
                  transition: `all 0.4s ease ${0.8 + i * 0.05}s`,
                }}
              >
                {/* Connection line */}
                <line
                  x1={esc.parentX}
                  y1={esc.parentY}
                  x2={esc.x}
                  y2={esc.y + esc.h / 2}
                  stroke={THEME.escalationStroke}
                  strokeWidth={2}
                  strokeDasharray="4,3"
                  opacity={0.7}
                />
                {/* Escalation node */}
                <rect
                  x={esc.x - esc.w / 2}
                  y={esc.y - esc.h / 2}
                  width={esc.w}
                  height={esc.h}
                  rx={5}
                  fill={THEME.escalationBg}
                  stroke={THEME.escalationStroke}
                  strokeWidth={2}
                />
                {/* Lightning icon */}
                <text
                  x={esc.x - esc.w / 2 + 12}
                  y={esc.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                >
                  ⚡
                </text>
                <SvgText
                  x={esc.x + 6}
                  y={esc.y}
                  text={esc.label}
                  width={esc.w - 28}
                  size={9}
                  color={THEME.escalationText}
                  maxLines={2}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BowtieDiagram;
