import { useId } from 'react'
import './InfoTooltip.css'

interface InfoTooltipProps {
  title: string
  description: string
  footer?: string
  ariaLabel?: string
}

export function InfoTooltip({ title, description, footer, ariaLabel }: InfoTooltipProps) {
  const tooltipId = useId()

  return (
    <span className="info-tooltip">
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-label={ariaLabel ?? `Mais informações sobre ${title}`}
        aria-describedby={tooltipId}
      >
        <span className="material-symbols-rounded" aria-hidden="true">info</span>
      </button>

      <span id={tooltipId} role="tooltip" className="info-tooltip-popover">
        <span className="info-tooltip-glow" aria-hidden="true" />
        <span className="info-tooltip-content">
          <span className="info-tooltip-heading">
            <span className="info-tooltip-icon" aria-hidden="true">
              <span className="material-symbols-rounded">info</span>
            </span>
            <strong>{title}</strong>
          </span>
          <span className="info-tooltip-description">{description}</span>
          {footer && (
            <span className="info-tooltip-footer">
              <span className="material-symbols-rounded" aria-hidden="true">check_circle</span>
              <span>{footer}</span>
            </span>
          )}
        </span>
        <span className="info-tooltip-arrow" aria-hidden="true" />
      </span>
    </span>
  )
}
