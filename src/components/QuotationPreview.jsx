import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Focus,
} from 'lucide-react';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

function QuotationPreview({
  form,
  items = [],
  specifications = [],
  terms = [],
  documentSettings = {},
}) {
  /* =======================================================
     DOCUMENT SETTINGS
     ======================================================= */

  const settings = {
    topPadding: 44,
    bottomPadding: 24,
    sidePadding: 18,
    fontSize: 10.5,
    lineHeight: 1.42,
    sectionGap: 10,
    itemGap: 8,
    ...documentSettings,
  };

  /* =======================================================
     PREVIEW REFERENCES
     ======================================================= */

  const viewportRef = useRef(null);
  const paperRef = useRef(null);

  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  /* =======================================================
     PREVIEW STATE
     ======================================================= */

  const [zoom, setZoom] = useState(1);

  const [isDragging, setIsDragging] =
    useState(false);

  const [fitMode, setFitMode] =
    useState(true);

  /* =======================================================
     BASIC HELPERS
     ======================================================= */

  const clampZoom = useCallback((value) => {
    return Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, value)
    );
  }, []);

  const formatZoom = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  /* =======================================================
     DATE FORMATTER
     ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /* =======================================================
     RATE FORMATTER
     ======================================================= */

  const formatRate = (rate) => {
    if (
      rate === '' ||
      rate === null ||
      rate === undefined
    ) {
      return '';
    }

    const numericRate = Number(rate);

    if (Number.isNaN(numericRate)) {
      return rate;
    }

    return numericRate.toLocaleString('en-PK');
  };

  /* =======================================================
     VISIBLE DATA
     ======================================================= */

  const visibleItems = items.filter(
    (item) =>
      item.coalName?.trim() ||
      item.size?.trim() ||
      item.description?.trim() ||
      String(item.rate || '').trim()
  );

  const visibleSpecifications =
    specifications.filter(
      (item) =>
        item.name?.trim() &&
        item.value?.trim()
    );

  const visibleTerms = terms.filter(
    (term) => term.text?.trim()
  );

  /* =======================================================
     RATE UNIT
     ======================================================= */

  const getRateUnit = (item) => {
    if (item.rateUnit === 'Custom') {
      return (
        item.customRateUnit?.trim() || ''
      );
    }

    return item.rateUnit || '';
  };

  /* =======================================================
     DOCUMENT CSS VARIABLES
     ======================================================= */

  const documentStyle = {
    '--doc-top-padding':
      `${settings.topPadding}mm`,

    '--doc-bottom-padding':
      `${settings.bottomPadding}mm`,

    '--doc-side-padding':
      `${settings.sidePadding}mm`,

    '--doc-font-size':
      `${settings.fontSize}pt`,

    '--doc-line-height':
      settings.lineHeight,

    '--doc-section-gap':
      `${settings.sectionGap}px`,

    '--doc-item-gap':
      `${settings.itemGap}px`,
  };

  /* =======================================================
     FIT PAPER TO AVAILABLE SCREEN
     ======================================================= */

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    const paper = paperRef.current;

    if (!viewport || !paper) {
      return;
    }

    /*
     * A little breathing room around paper.
     */
    const horizontalGap = 28;
    const verticalGap = 28;

    const availableWidth = Math.max(
      viewport.clientWidth - horizontalGap,
      100
    );

    const availableHeight = Math.max(
      viewport.clientHeight - verticalGap,
      100
    );

    /*
     * offsetWidth/offsetHeight return the natural
     * unscaled dimensions of the A4 page.
     */
    const paperWidth = paper.offsetWidth;
    const paperHeight = paper.offsetHeight;

    if (!paperWidth || !paperHeight) {
      return;
    }

    const widthScale =
      availableWidth / paperWidth;

    const heightScale =
      availableHeight / paperHeight;

    /*
     * Never automatically enlarge above 100%.
     * This keeps desktop preview crisp and natural.
     */
    const nextZoom = clampZoom(
      Math.min(
        widthScale,
        heightScale,
        1
      )
    );

    setZoom(nextZoom);
    setFitMode(true);

    requestAnimationFrame(() => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    });
  }, [clampZoom]);

  /* =======================================================
     ZOOM CONTROLS
     ======================================================= */

  const changeZoom = useCallback(
    (difference) => {
      setFitMode(false);

      setZoom((currentZoom) =>
        clampZoom(
          Number(
            (
              currentZoom + difference
            ).toFixed(2)
          )
        )
      );
    },
    [clampZoom]
  );

  const zoomIn = () => {
    changeZoom(ZOOM_STEP);
  };

  const zoomOut = () => {
    changeZoom(-ZOOM_STEP);
  };

  const resetZoom = () => {
    setFitMode(false);
    setZoom(1);

    requestAnimationFrame(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return;
      }

      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    });
  };

  const focusPaper = () => {
    setFitMode(false);

    setZoom((currentZoom) => {
      if (currentZoom < 1) {
        return 1;
      }

      if (currentZoom < 1.5) {
        return 1.5;
      }

      return 1;
    });
  };

  /* =======================================================
     POINTER DRAG / PAN
     Works with:
     - Mouse
     - Touch
     - Pen
     ======================================================= */

  const handlePointerDown = (event) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    /*
     * Ignore right mouse button.
     */
    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {
      return;
    }

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };

    setIsDragging(true);

    try {
      viewport.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Safe fallback for unsupported browsers.
    }
  };

  const handlePointerMove = (event) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;

    if (
      !viewport ||
      !dragState.active ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    const deltaX =
      event.clientX - dragState.startX;

    const deltaY =
      event.clientY - dragState.startY;

    viewport.scrollLeft =
      dragState.scrollLeft - deltaX;

    viewport.scrollTop =
      dragState.scrollTop - deltaY;
  };

  const endDragging = (event) => {
    const viewport = viewportRef.current;

    if (
      dragStateRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;

    setIsDragging(false);

    if (viewport) {
      try {
        viewport.releasePointerCapture(
          event.pointerId
        );
      } catch {
        // Safe fallback.
      }
    }
  };

  /* =======================================================
     CTRL + MOUSE WHEEL ZOOM
     ======================================================= */

  const handleWheel = useCallback(
    (event) => {
      if (
        !event.ctrlKey &&
        !event.metaKey
      ) {
        return;
      }

      event.preventDefault();

      setFitMode(false);

      setZoom((currentZoom) => {
        const direction =
          event.deltaY < 0
            ? ZOOM_STEP
            : -ZOOM_STEP;

        return clampZoom(
          Number(
            (
              currentZoom + direction
            ).toFixed(2)
          )
        );
      });
    },
    [clampZoom]
  );

  /* =======================================================
     INITIAL RESPONSIVE FIT
     ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitToScreen();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fitToScreen]);

  /* =======================================================
     RESPONSIVE RESIZE OBSERVER
     ======================================================= */

  useEffect(() => {
    const viewport = viewportRef.current;

    if (
      !viewport ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    const resizeObserver =
      new ResizeObserver(() => {
        if (fitMode) {
          fitToScreen();
        }
      });

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitMode, fitToScreen]);

  /* =======================================================
     NON-PASSIVE WHEEL LISTENER
     Required to prevent browser page zoom while
     zooming only the quotation preview.
     ======================================================= */

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.addEventListener(
      'wheel',
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      viewport.removeEventListener(
        'wheel',
        handleWheel
      );
    };
  }, [handleWheel]);

  /* =======================================================
     SCALED PAPER SIZE
     This wrapper gives real scrollable dimensions even
     though CSS transform itself doesn't affect layout.
     ======================================================= */

  const scaledPaperStyle = {
    width: `calc(210mm * ${zoom})`,
    height: `calc(297mm * ${zoom})`,
  };

  const paperTransformStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  /* =======================================================
     COMPONENT
     ======================================================= */

  return (
    <div className="interactive-quotation-preview">

      {/* ===================================================
          PREVIEW TOOLBAR
          =================================================== */}

      <div className="quotation-preview-toolbar no-print">

        <div className="preview-toolbar-info">
          <div className="preview-toolbar-icon">
            <Move size={17} />
          </div>

          <div>
            <strong>
              Interactive Preview
            </strong>

            <span>
              Drag paper to move · Ctrl + wheel
              to zoom
            </span>
          </div>
        </div>

        <div className="preview-toolbar-controls">

          <button
            type="button"
            className="preview-tool-btn"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={17} />
          </button>

          <button
            type="button"
            className="preview-zoom-value"
            onClick={resetZoom}
            title="Reset to 100%"
          >
            {formatZoom(zoom)}
          </button>

          <button
            type="button"
            className="preview-tool-btn"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={17} />
          </button>

          <span className="preview-toolbar-divider" />

          <button
            type="button"
            className={
              fitMode
                ? 'preview-tool-btn active'
                : 'preview-tool-btn'
            }
            onClick={fitToScreen}
            title="Fit paper to screen"
            aria-label="Fit paper to screen"
          >
            <Maximize2 size={17} />
          </button>

          <button
            type="button"
            className="preview-tool-btn"
            onClick={focusPaper}
            title="Focus paper"
            aria-label="Focus paper"
          >
            <Focus size={17} />
          </button>

          <button
            type="button"
            className="preview-tool-btn"
            onClick={resetZoom}
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw size={17} />
          </button>

        </div>
      </div>

      {/* ===================================================
          VIEWPORT
          =================================================== */}

      <div
        ref={viewportRef}
        className={
          isDragging
            ? 'quotation-preview-viewport is-dragging'
            : 'quotation-preview-viewport'
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDragging}
        onPointerCancel={endDragging}
        onDoubleClick={focusPaper}
      >
        <div className="quotation-preview-stage">

          <div
            className="scaled-paper-space"
            style={scaledPaperStyle}
          >
            <div
              ref={paperRef}
              className="a4-page"
              id="quotation-print-area"
              style={{
                ...documentStyle,
                ...paperTransformStyle,
              }}
            >
              <img
                src="/letterhead.png"
                alt=""
                className="letterhead-background"
                draggable="false"
              />

              <div className="quotation-document reference-document">

                {/* =========================================
                    CUSTOMER + DATE
                    ========================================= */}

                <div className="quotation-top-information">

                  <div className="quotation-customer-info">

                    {form.companyName?.trim() && (
                      <>
                        <span className="customer-label">
                          To:
                        </span>

                        <h2>
                          {form.companyName}
                        </h2>
                      </>
                    )}

                    {form.address?.trim() && (
                      <p>{form.address}</p>
                    )}

                  </div>

                  {form.date && (
                    <div className="reference-date">
                      {formatDate(form.date)}
                    </div>
                  )}

                </div>

                {/* =========================================
                    QUOTATION NUMBER
                    ========================================= */}

                {form.quotationNumber?.trim() && (
                  <div className="quotation-number-reference">
                    Ref: {form.quotationNumber}
                  </div>
                )}

                {/* =========================================
                    SUBJECT
                    ========================================= */}

                {form.subject?.trim() && (
                  <div className="reference-subject-row">

                    <strong>
                      Subject:
                    </strong>

                    <span>
                      {form.subject}
                    </span>

                  </div>
                )}

                {/* =========================================
                    SALUTATION
                    ========================================= */}

                {form.salutation?.trim() && (
                  <p className="reference-salutation">
                    <strong>
                      {form.salutation}
                    </strong>
                  </p>
                )}

                {/* =========================================
                    INTRODUCTION
                    ========================================= */}

                {form.introduction?.trim() && (
                  <p className="reference-introduction">
                    {form.introduction}
                  </p>
                )}

                {/* =========================================
                    ITEMS
                    ========================================= */}

                {visibleItems.map(
                  (item, index) => {
                    const rateUnit =
                      getRateUnit(item);

                    return (
                      <section
                        className="quotation-item-section"
                        key={
                          item.id || index
                        }
                      >

                        {item.coalName?.trim() && (
                          <div className="coal-item-heading">

                            <strong>
                              {item.coalName}:
                            </strong>

                            {item.deliveryType?.trim() && (
                              <span>
                                (
                                {
                                  item.deliveryType
                                }
                                )
                              </span>
                            )}

                          </div>
                        )}

                        {item.rate && (
                          <div className="price-per-unit-line">

                            <strong>
                              Price{' '}
                              {rateUnit ||
                                'Per Metric Ton'}
                              :
                            </strong>

                            <span>
                              {item.currency
                                ? `${item.currency} `
                                : ''}

                              {formatRate(
                                item.rate
                              )}
                            </span>

                          </div>
                        )}

                        {(item.size?.trim() ||
                          item.description?.trim() ||
                          item.rate) && (
                          <div className="reference-item-table">

                            <div className="reference-item-header">

                              <span>
                                Size
                              </span>

                              <span>
                                Description
                              </span>

                              <span>
                                {item.taxLabel?.trim() ||
                                  'Price'}
                              </span>

                            </div>

                            <div className="reference-item-body">

                              <span>
                                {item.size || ''}
                              </span>

                              <span>
                                {item.description ||
                                  ''}
                              </span>

                              <span>
                                {item.rate
                                  ? `${
                                      item.currency
                                        ? `${item.currency} `
                                        : ''
                                    }${formatRate(
                                      item.rate
                                    )}`
                                  : ''}
                              </span>

                            </div>

                          </div>
                        )}

                      </section>
                    );
                  }
                )}

                {/* =========================================
                    SPECIFICATIONS
                    ========================================= */}

                {visibleSpecifications.length >
                  0 && (
                  <section className="reference-specifications">

                    <h3>
                      SPECIFICATION OF{' '}
                      {visibleItems[0]
                        ?.coalName?.trim() ||
                        'COAL'}
                    </h3>

                    <div className="reference-spec-grid">

                      {visibleSpecifications.map(
                        (item) => (
                          <div
                            className="reference-spec-row"
                            key={item.id}
                          >

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.value}
                            </span>

                          </div>
                        )
                      )}

                    </div>

                  </section>
                )}

                {/* =========================================
                    TERMS
                    ========================================= */}

                {visibleTerms.length > 0 && (
                  <section className="reference-terms">

                    {visibleTerms.map(
                      (term) => (
                        <div
                          className="reference-term-row"
                          key={term.id}
                        >

                          <span className="reference-term-dash">
                            -
                          </span>

                          <span>
                            {term.text}
                          </span>

                        </div>
                      )
                    )}

                  </section>
                )}

                {/* =========================================
                    QUERY TEXT
                    ========================================= */}

                {form.queryText?.trim() && (
                  <p className="reference-query-text">

                    <strong>
                      {form.queryText}
                    </strong>

                  </p>
                )}

                {/* =========================================
                    SIGNATURE
                    ========================================= */}

                {(form.closingText?.trim() ||
                  form.signatoryName?.trim()) && (
                  <div className="reference-signature">

                    {form.closingText?.trim() && (
                      <p>
                        {form.closingText}
                      </p>
                    )}

                    {form.signatoryName?.trim() && (
                      <strong>
                        {form.signatoryName}
                      </strong>
                    )}

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default QuotationPreview;