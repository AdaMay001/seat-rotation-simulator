import React, { useMemo, useState, useEffect } from "react";

const ROWS = 7;
const COLS = 6;
const WEEKS = 18;

// 舒适区：2、3、4、5列的2排、3排、4排、5排
const comfortRows = new Set([2, 3, 4, 5]);
const comfortCols = new Set([2, 3, 4, 5]);

// 不适区：1列的1/6/7排；6列的1/6/7排；2至5列的7排
const unfitSeats = new Set(["1-1", "1-6", "1-7", "6-1", "6-6", "6-7","2-7","3-7","4-7", "5-7"]);

// 打分规则
//const rowScores = { 1: 2, 2: 5, 3: 5, 4: 5, 5: 3, 6: 1, 7: 1 };
const rowScores = { 1: 2, 2: 5, 3: 5, 4: 5, 5: 4, 6: 2, 7: 1 };
const colScores = { 1: 1, 2: 4, 3: 5, 4: 5, 5: 4, 6: 1 };

function getSeat(weekIndex, startRow, startCol) {
  const row = ((startRow - 1 + weekIndex) % ROWS) + 1;
  const col =
    ((startCol - 1 - Math.floor(weekIndex / 2)) % COLS + COLS) % COLS + 1;
  return { row, col };
}

function isComfort(row, col) {
  return comfortRows.has(row) && comfortCols.has(col);
}

function isUnfit(row, col) {
  return unfitSeats.has(`${col}-${row}`);
}

function seatScore(row, col) {
  return rowScores[row] + colScores[col];
}

function simulate(startRow, startCol) {
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const seat = getSeat(i, startRow, startCol);
    return {
      week: i + 1,
      ...seat,
      score: seatScore(seat.row, seat.col),
      comfort: isComfort(seat.row, seat.col),
      unfit: isUnfit(seat.row, seat.col),
    };
  });

  const totalScore = weeks.reduce((sum, w) => sum + w.score, 0);
  const comfortWeeks = weeks.filter((w) => w.comfort).length;
  const unfitWeeks = weeks.filter((w) => w.unfit).length;

  return { weeks, totalScore, comfortWeeks, unfitWeeks };
}

function Dot({
  active = false,
  selected = false,
  comfort = false,
  unfit = false,
  onClick,
}) {
  let background = "#3b82f6"; // 普通蓝
  let boxShadow = "none";

  if (comfort) background = "#fde68a"; // 浅黄
  if (unfit) background = "#94a3b8"; // 灰
  if (selected) background = "#f97316"; // 橘
  if (active) {
    background = "#f97316";
    boxShadow = "0 0 0 8px rgba(251, 191, 36, 0.22)";
  }

  return (
    <button
      onClick={onClick}
      title="seat"
      style={{
        width: 32,
        height: 32,
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        background,
        boxShadow,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    />
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 24,
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return (
    <div
      style={{
        padding: "24px 24px 12px 24px",
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <h2
      style={{
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: "#0f172a",
      }}
    >
      {children}
    </h2>
  );
}

function CardContent({ children, style = {} }) {
  return (
    <div
      style={{
        padding: "0 24px 24px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, outline = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 14,
        padding: "10px 16px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        border: outline ? "1px solid #cbd5e1" : "1px solid #0f172a",
        background: outline ? "#ffffff" : "#0f172a",
        color: outline ? "#0f172a" : "#ffffff",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: "#f1f5f9",
        padding: 16,
      }}
    >
      {label ? (
        <div
          style={{
            color: "#64748b",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export default function SeatRotationSimulator() {
  const [startRow, setStartRow] = useState(2);
  const [startCol, setStartCol] = useState(4);
  const [confirmed, setConfirmed] = useState(true);
  const [week, setWeek] = useState(1);
  const [playing, setPlaying] = useState(false);

  const result = useMemo(() => simulate(startRow, startCol), [startRow, startCol]);
  const currentSeat = result.weeks[Math.min(week - 1, WEEKS - 1)];

  useEffect(() => {
    if (!playing) return;
    if (week >= WEEKS) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setWeek((w) => w + 1), 850);
    return () => clearTimeout(timer);
  }, [playing, week]);

  const handlePlay = () => {
    setConfirmed(true);
    setWeek(1);
    setPlaying(true);
  };

  const formulaText = result.weeks.map((w) => `${w.score}`).join(" + ");
  const sigmaFormula = "Σ(m+n)";

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 1100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: isNarrow ? 16 : 28,
        color: "#0f172a",
        boxSizing: "border-box",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            换座位模拟器
          </h1>
          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "#475569",
              fontSize: 14,
              lineHeight: 1.9,
              maxWidth: 900,
            }}
          >
            规则：每周向后移动1排，每两周向左移动1列，越界后循环。蓝点是普通座位，浅黄色点是舒适区，灰点是不适区，橘点是选定的初始位置。点击座位后即视为选定，可按周播放，18周结束后自动停止。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "360px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>本学期得分</CardTitle>
            </CardHeader>

            <CardContent>
              <div style={{ display: "grid", gap: 16, fontSize: 14, lineHeight: 1.9 }}>
                <InfoBlock label="初始位置">
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {startCol}列 {startRow}排
                  </div>
                </InfoBlock>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <InfoBlock label="总分">
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{result.totalScore}</div>
                  </InfoBlock>
                  <InfoBlock label="当前周次">
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{week}</div>
                  </InfoBlock>
                </div>

                <InfoBlock>
                  <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>
                    舒适区停留周数
                  </div>
                  <div style={{ fontWeight: 700 }}>{result.comfortWeeks} 周</div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      marginTop: 12,
                      marginBottom: 6,
                    }}
                  >
                    不适区停留周数
                  </div>
                  <div style={{ fontWeight: 700 }}>{result.unfitWeeks} 周</div>
                </InfoBlock>

                <InfoBlock>
                  <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                    当前所在位置
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    第 {currentSeat.week} 周：{currentSeat.col}列 {currentSeat.row}排
                  </div>
                  <div style={{ color: "#475569", marginTop: 6 }}>
                    该周分数 = 排分 {rowScores[currentSeat.row]} + 列分{" "}
                    {colScores[currentSeat.col]} = {currentSeat.score}
                  </div>
                </InfoBlock>

                <InfoBlock>
                  <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                    计分规则
                  </div>
                  <div>排分：1排=2，2排=5，3排=5，4排=5，5排=4，6排=2，7排=1。</div>
                  <div>列分：1列=1，2列=4，3列=5，4列=5，5列=4，6列=1。</div>
                  <div style={{ marginTop: 8, color: "#475569" }}>
                  说明：前中部位置得分最高，第5排仍属于较舒适区域但略低于第2至4排；第6排已偏后，得分下降；第7排为最后一排，得分最低。列方向上，中间两列最佳，两侧最差。
                  </div>
                </InfoBlock>

                <InfoBlock>
                  <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                    本学期计分算式
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                    {sigmaFormula}，其中 m=列分，n=排分
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#334155",
                      lineHeight: 1.8,
                      marginTop: 8,
                      wordBreak: "break-word",
                      maxHeight: 180,
                      overflow: "auto",
                    }}
                  >
                    = {formulaText}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #cbd5e1",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    = {result.totalScore}
                  </div>
                </InfoBlock>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>座位阵列</CardTitle>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  marginBottom: 20,
                  marginLeft: 30,
                }}
              >
                <div
                  style={{
                    width: 410,
                    maxWidth: "100%",
                    height: 40,
                    borderRadius: 12,
                    background: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  黑板
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  justifyContent: "center",
                  gap: 24,
                  flexWrap: isNarrow ? "wrap" : "nowrap",
                }}
              >
                <div
                  style={{
                    width: 24,
                    borderRadius: 999,
                    background: "rgba(148,163,184,0.6)",
                    minHeight: 360,
                  }}
                />

                <div style={{ display: "grid", gap: 16 }}>
                  {Array.from({ length: ROWS }, (_, rowIndex) => {
                    const row = rowIndex + 1;
                    return (
                      <div
                        key={row}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            fontSize: 14,
                            color: "#64748b",
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {row}排
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, 1fr)",
                            gap: 24,
                          }}
                        >
                          {Array.from({ length: COLS }, (_, colIndex) => {
                            const col = colIndex + 1;
                            const isSelected =
                              confirmed &&
                              !playing &&
                              startRow === row &&
                              startCol === col;
                            const isActive =
                              confirmed &&
                              currentSeat.row === row &&
                              currentSeat.col === col;

                            return (
                              <div
                                key={`${row}-${col}`}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {row === 1 ? (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "#94a3b8",
                                      height: 16,
                                    }}
                                  >
                                    {col}列
                                  </div>
                                ) : (
                                  <div style={{ height: 16 }} />
                                )}

                                <Dot
                                  selected={isSelected}
                                  active={isActive}
                                  comfort={isComfort(row, col)}
                                  unfit={isUnfit(row, col)}
                                  onClick={() => {
                                    setStartRow(row);
                                    setStartCol(col);
                                    setConfirmed(true);
                                    setPlaying(false);
                                    setWeek(1);
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    width: 24,
                    borderRadius: 999,
                    background: "rgba(148,163,184,0.6)",
                    minHeight: 360,
                  }}
                />

                <div
                  style={{
                    minWidth: 150,
                    alignSelf: "center",
                    borderRadius: 18,
                    background: "#f1f5f9",
                    padding: 16,
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    图例
                  </div>

                  <Legend color="#3b82f6" text="普通座位" />
                  <Legend color="#fde68a" text="舒适区" withBorder />
                  <Legend color="#94a3b8" text="不适区" />
                  <Legend color="#f97316" text="当前选定位置" />
                </div>
              </div>

              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <ActionButton onClick={handlePlay}>开始18周模拟</ActionButton>

                <ActionButton
                  outline
                  onClick={() => {
                    setPlaying(false);
                    setWeek((w) => Math.min(WEEKS, w + 1));
                    setConfirmed(true);
                  }}
                >
                  下一周
                </ActionButton>

                <ActionButton
                  outline
                  onClick={() => {
                    setPlaying(false);
                    setWeek(1);
                    setConfirmed(true);
                  }}
                >
                  回到第1周
                </ActionButton>
              </div>

              <div
                style={{
                  marginTop: 24,
                  borderRadius: 18,
                  background: "#f1f5f9",
                  padding: 16,
                  fontSize: 14,
                  color: "#475569",
                  lineHeight: 1.9,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 8,
                  }}
                >
                  区域定义
                </div>
                <div>舒适区：2、3、4、5列的2排、3排、4排、5排。</div>
                <div>
                  不适区：1列的1排、6排、7排，6列的1排、6排、7排，以及2至5列的7排。
                </div>
                <div style={{ marginTop: 8 }}>
                  当前界面中：点击座位后会直接选定为橘色；开始播放后，孩子当前所在的位置会继续显示为橘色，用浅色光环强调正在停留的位置。
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, text, withBorder = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 10,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: color,
          display: "inline-block",
          border: withBorder ? "1px solid #f59e0b" : "none",
          flexShrink: 0,
        }}
      />
      <span>{text}</span>
    </div>
  );
}