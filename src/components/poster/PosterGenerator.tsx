import React, { useState, useRef, useCallback } from "react";
import { PosterPreview, type PosterData, type ContentItem } from "./PosterPreview";
import { toPng } from "html-to-image";

interface Props {
  lang: "zh" | "en";
}

const defaultData: PosterData = {
  forumTitle: "Agents特区论坛",
  episodeNumber: 17,
  title: "跨境电商行业的\nSOP改造Skill\n机遇和挑战",
  description:
    "当AI席卷而来，特别是OpenClaw开启全民养虾之后，跨境行业如何迎接变化？纯干货分享SOP转向Skill之后如何改造，借鉴经验进行其他行业赋能。",
  contentItems: [
    { tag: "SOP→Skill", text: "跨境行业中如何进行SOP到Skill的改造？" },
    { tag: "经验分享", text: "跨境行业Skill改造中的问题和实战经验分享" },
    { tag: "未来展望", text: "未来Agent时代各行业该何去何从？" },
  ],
  speaker: {
    name: "Axton Wang",
    nameCn: "王帅辉",
    title: "10+年互联网架构师，跨境AI从业者",
    subtitle: "日耗费10亿Token",
  },
  date: "2026.03.22 (周日)",
  timezones:
    "北京 CST 20:00-21:30 | 欧洲 CET 13:00-14:30 | 美东 EDT 08:00-09:30 | 美西 PDT 05:00-06:30",
  meetingId: "740 886 774",
};

const labels = {
  zh: {
    title: "海报生成器",
    subtitle: "为 Agents特区论坛 活动生成海报",
    forumTitle: "论坛名称",
    episodeNumber: "期数",
    posterTitle: "标题（换行用 \\n）",
    description: "描述",
    sectionContent: "本期内容",
    tagLabel: "标签",
    textLabel: "内容",
    addItem: "+ 添加条目",
    removeItem: "删除",
    sectionSpeaker: "分享嘉宾",
    sectionHost: "主持人（可选）",
    enableHost: "添加主持人",
    name: "姓名",
    nameCn: "中文名（可选）",
    personTitle: "职位/简介",
    personSubtitle: "副标题（可选）",
    photo: "照片",
    sectionEvent: "活动信息",
    date: "日期",
    timezones: "时区信息",
    meetingId: "会议号",
    meetingQr: "会议二维码",
    download: "下载海报 PNG",
    downloading: "生成中...",
  },
  en: {
    title: "Poster Generator",
    subtitle: "Generate posters for Agents Zone Forum events",
    forumTitle: "Forum Name",
    episodeNumber: "Episode #",
    posterTitle: "Title (use \\n for line breaks)",
    description: "Description",
    sectionContent: "Content Items",
    tagLabel: "Tag",
    textLabel: "Text",
    addItem: "+ Add Item",
    removeItem: "Remove",
    sectionSpeaker: "Speaker",
    sectionHost: "Host (Optional)",
    enableHost: "Add Host",
    name: "Name",
    nameCn: "Chinese Name (optional)",
    personTitle: "Title / Bio",
    personSubtitle: "Subtitle (optional)",
    photo: "Photo",
    sectionEvent: "Event Info",
    date: "Date",
    timezones: "Timezone Info",
    meetingId: "Meeting ID",
    meetingQr: "Meeting QR Code",
    download: "Download PNG",
    downloading: "Generating...",
  },
};

export const PosterGenerator: React.FC<Props> = ({ lang }) => {
  const t = labels[lang];
  const [data, setData] = useState<PosterData>(defaultData);
  const [hasHost, setHasHost] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const update = useCallback(
    (patch: Partial<PosterData>) => setData((d) => ({ ...d, ...patch })),
    []
  );

  const updateSpeaker = useCallback(
    (patch: Partial<PosterData["speaker"]>) =>
      setData((d) => ({ ...d, speaker: { ...d.speaker, ...patch } })),
    []
  );

  const updateHost = useCallback(
    (patch: Partial<NonNullable<PosterData["host"]>>) =>
      setData((d) => ({
        ...d,
        host: { ...(d.host || { name: "", title: "" }), ...patch },
      })),
    []
  );

  const updateContentItem = useCallback(
    (index: number, patch: Partial<ContentItem>) =>
      setData((d) => ({
        ...d,
        contentItems: d.contentItems.map((item, i) =>
          i === index ? { ...item, ...patch } : item
        ),
      })),
    []
  );

  const addContentItem = useCallback(
    () =>
      setData((d) => ({
        ...d,
        contentItems: [...d.contentItems, { tag: "", text: "" }],
      })),
    []
  );

  const removeContentItem = useCallback(
    (index: number) =>
      setData((d) => ({
        ...d,
        contentItems: d.contentItems.filter((_, i) => i !== index),
      })),
    []
  );

  const handlePhotoUpload = useCallback(
    (target: "speaker" | "host", file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (target === "speaker") {
          updateSpeaker({ photo: dataUrl });
        } else {
          updateHost({ photo: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    },
    [updateSpeaker, updateHost]
  );

  const handleQrUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        update({ meetingQrCode: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    },
    [update]
  );

  const handleDownload = useCallback(async () => {
    const el = document.getElementById("poster-canvas");
    if (!el) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(el, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `poster-ep${data.episodeNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate poster:", err);
      alert("Failed to generate poster image. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [data.episodeNumber]);

  const toggleHost = useCallback(() => {
    setHasHost((v) => {
      if (!v) {
        setData((d) => ({
          ...d,
          host: { name: "", title: "" },
        }));
      } else {
        setData((d) => ({ ...d, host: undefined }));
      }
      return !v;
    });
  }, []);

  // Shared input styles
  const inputClass =
    "w-full rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";
  const labelClass =
    "block text-xs font-medium text-[var(--color-text-muted)] mb-1";
  const sectionClass = "mb-6";
  const sectionTitleClass =
    "text-sm font-semibold text-[var(--color-text-primary)] mb-3 border-b border-[var(--color-surface-border)] pb-2";

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* Form */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          maxHeight: "85vh",
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        {/* Basic info */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>
            {lang === "zh" ? "基本信息" : "Basic Info"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
            <div>
              <label className={labelClass}>{t.forumTitle}</label>
              <input
                className={inputClass}
                value={data.forumTitle}
                onChange={(e) => update({ forumTitle: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t.episodeNumber}</label>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={data.episodeNumber}
                onChange={(e) =>
                  update({ episodeNumber: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.posterTitle}</label>
            <input
              className={inputClass}
              value={data.title.replace(/\n/g, "\\n")}
              onChange={(e) =>
                update({ title: e.target.value.replace(/\\n/g, "\n") })
              }
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.description}</label>
            <textarea
              className={inputClass}
              rows={3}
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        {/* Content items */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>{t.sectionContent}</h3>
          {data.contentItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                className={inputClass}
                placeholder={t.tagLabel}
                value={item.tag}
                onChange={(e) => updateContentItem(i, { tag: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder={t.textLabel}
                value={item.text}
                onChange={(e) =>
                  updateContentItem(i, { text: e.target.value })
                }
              />
              <button
                onClick={() => removeContentItem(i)}
                className="px-2 py-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                title={t.removeItem}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addContentItem}
            className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-colors"
          >
            {t.addItem}
          </button>
        </div>

        {/* Speaker */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>{t.sectionSpeaker}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label className={labelClass}>{t.name}</label>
              <input
                className={inputClass}
                value={data.speaker.name}
                onChange={(e) => updateSpeaker({ name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t.nameCn}</label>
              <input
                className={inputClass}
                value={data.speaker.nameCn || ""}
                onChange={(e) =>
                  updateSpeaker({ nameCn: e.target.value || undefined })
                }
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.personTitle}</label>
            <input
              className={inputClass}
              value={data.speaker.title}
              onChange={(e) => updateSpeaker({ title: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.personSubtitle}</label>
            <input
              className={inputClass}
              value={data.speaker.subtitle || ""}
              onChange={(e) =>
                updateSpeaker({ subtitle: e.target.value || undefined })
              }
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.photo}</label>
            <input
              type="file"
              accept="image/*"
              className={inputClass}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload("speaker", file);
              }}
            />
          </div>
        </div>

        {/* Host */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>{t.sectionHost}</h3>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            <input
              type="checkbox"
              checked={hasHost}
              onChange={toggleHost}
              className="rounded"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">
              {t.enableHost}
            </span>
          </label>
          {hasHost && data.host && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label className={labelClass}>{t.name}</label>
                  <input
                    className={inputClass}
                    value={data.host.name}
                    onChange={(e) => updateHost({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.nameCn}</label>
                  <input
                    className={inputClass}
                    value={data.host.nameCn || ""}
                    onChange={(e) =>
                      updateHost({ nameCn: e.target.value || undefined })
                    }
                  />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className={labelClass}>{t.personTitle}</label>
                <input
                  className={inputClass}
                  value={data.host.title}
                  onChange={(e) => updateHost({ title: e.target.value })}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className={labelClass}>{t.personSubtitle}</label>
                <input
                  className={inputClass}
                  value={data.host.subtitle || ""}
                  onChange={(e) =>
                    updateHost({ subtitle: e.target.value || undefined })
                  }
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className={labelClass}>{t.photo}</label>
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload("host", file);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Event info */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>{t.sectionEvent}</h3>
          <div>
            <label className={labelClass}>{t.date}</label>
            <input
              className={inputClass}
              value={data.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>{t.timezones}</label>
            <input
              className={inputClass}
              value={data.timezones || ""}
              onChange={(e) =>
                update({ timezones: e.target.value || undefined })
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <div>
              <label className={labelClass}>{t.meetingId}</label>
              <input
                className={inputClass}
                value={data.meetingId || ""}
                onChange={(e) =>
                  update({ meetingId: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t.meetingQr}</label>
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleQrUpload(file);
                }}
              />
            </div>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: "100%",
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: downloading
              ? "var(--color-text-muted)"
              : "linear-gradient(135deg, #6b5ce7, #a855f7)",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 600,
            cursor: downloading ? "not-allowed" : "pointer",
            marginBottom: 24,
            transition: "opacity 0.2s",
          }}
        >
          {downloading ? t.downloading : t.download}
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          position: "sticky",
          top: 20,
          flexShrink: 0,
        }}
      >
        <PosterPreview data={data} scale={0.38} />
      </div>
    </div>
  );
};

export default PosterGenerator;
