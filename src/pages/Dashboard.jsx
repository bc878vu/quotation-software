import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  FilePlus2,
  FileText,
  Search,
  Eye,
  Pencil,
  Trash2,
  Printer,
  Copy,
  CalendarDays,
  Building2,
  Banknote,
  Hash,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'alFalahQuotations';

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [quotations, setQuotations] =
    useState([]);

  const [search, setSearch] = useState('');

  /* =======================================================
     LOAD QUOTATIONS
     ======================================================= */

  const loadQuotations = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ||
          '[]'
      );

      const validQuotations = Array.isArray(saved)
        ? saved
        : [];

      /*
       * Latest quotation always appears first.
       */
      const sortedQuotations = [
        ...validQuotations,
      ].sort((a, b) => {
        const aTime = new Date(
          a.updatedAt ||
            a.createdAt ||
            a.form?.date ||
            0
        ).getTime();

        const bTime = new Date(
          b.updatedAt ||
            b.createdAt ||
            b.form?.date ||
            0
        ).getTime();

        return bTime - aTime;
      });

      setQuotations(sortedQuotations);
    } catch (error) {
      console.error(
        'Unable to load quotations:',
        error
      );

      setQuotations([]);
    }
  };

  /* =======================================================
     AUTO REFRESH EVENTS
     ======================================================= */

  useEffect(() => {
    loadQuotations();

    const refresh = () => {
      loadQuotations();
    };

    window.addEventListener(
      'storage',
      refresh
    );

    window.addEventListener(
      'quotation-storage-updated',
      refresh
    );

    window.addEventListener(
      'focus',
      refresh
    );

    return () => {
      window.removeEventListener(
        'storage',
        refresh
      );

      window.removeEventListener(
        'quotation-storage-updated',
        refresh
      );

      window.removeEventListener(
        'focus',
        refresh
      );
    };
  }, []);

  /* =======================================================
     FILTER QUOTATIONS
     ======================================================= */

  const filteredQuotations = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return quotations;
    }

    return quotations.filter((quotation) => {
      const form = quotation.form || {};

      const searchableText = [
        form.quotationNumber,
        form.companyName,
        form.address,
        form.subject,
        form.signatoryName,

        ...(quotation.items || []).flatMap(
          (item) => [
            item.coalName,
            item.description,
            item.rate,
            item.currency,
          ]
        ),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [quotations, search]);

  /* =======================================================
     DATE FORMATTER
     ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  /* =======================================================
     RATE FORMATTER
     ======================================================= */

  const formatRate = (quotation) => {
    const firstItem =
      quotation.items?.find(
        (item) =>
          item.rate !== '' &&
          item.rate !== null &&
          item.rate !== undefined
      );

    if (!firstItem) {
      return '-';
    }

    const amount = Number(firstItem.rate);

    const formattedAmount =
      Number.isNaN(amount)
        ? firstItem.rate
        : amount.toLocaleString('en-PK');

    return `${
      firstItem.currency || 'PKR'
    } ${formattedAmount}`;
  };

  /* =======================================================
     COMPANY NAME
     ======================================================= */

  const getCompanyName = (quotation) => {
    return (
      quotation.form?.companyName?.trim() ||
      'Not specified'
    );
  };

  /* =======================================================
     SUBJECT
     ======================================================= */

  const getSubject = (quotation) => {
    return (
      quotation.form?.subject?.trim() ||
      'No subject'
    );
  };

  /* =======================================================
     DELETE QUOTATION
     ======================================================= */

  const deleteQuotation = (id) => {
    const quotation = quotations.find(
      (item) =>
        String(item.id) === String(id)
    );

    const quotationNumber =
      quotation?.form?.quotationNumber ||
      'this quotation';

    const confirmed = window.confirm(
      `Delete ${quotationNumber}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const updated = quotations.filter(
      (item) =>
        String(item.id) !== String(id)
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setQuotations(updated);

    window.dispatchEvent(
      new Event(
        'quotation-storage-updated'
      )
    );
  };

  /* =======================================================
     NEXT QUOTATION NUMBER
     ======================================================= */

  const getNextNumber = () => {
    const year = new Date().getFullYear();

    const usedNumbers = quotations
      .map(
        (quotation) =>
          quotation.form?.quotationNumber ||
          ''
      )
      .filter((number) =>
        number.startsWith(`AFC-${year}-`)
      )
      .map((number) => {
        const parts = number.split('-');

        return (
          Number(
            parts[parts.length - 1]
          ) || 0
        );
      });

    const next =
      usedNumbers.length > 0
        ? Math.max(...usedNumbers) + 1
        : 1;

    return `AFC-${year}-${String(
      next
    ).padStart(3, '0')}`;
  };

  /* =======================================================
     DUPLICATE QUOTATION
     ======================================================= */

  const duplicateQuotation = (
    quotation
  ) => {
    const newId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const now = new Date().toISOString();

    const duplicate = {
      ...quotation,

      id: newId,

      form: {
        ...(quotation.form || {}),

        quotationNumber:
          getNextNumber(),
      },

      createdAt: now,
      updatedAt: now,
    };

    const updated = [
      duplicate,
      ...quotations,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setQuotations(updated);

    window.dispatchEvent(
      new Event(
        'quotation-storage-updated'
      )
    );

    navigate(
      `/quotations/edit/${newId}`
    );
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="dashboard-page">

      {/* ===================================================
          PAGE HEADER
          =================================================== */}

      <div className="page-header no-print">

        <div className="dashboard-heading">
          <h1>Quotation Dashboard</h1>

          <p>
            Create, manage, edit and print
            professional quotations.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn dashboard-new-btn"
          onClick={() =>
            navigate('/quotations/new')
          }
        >
          <FilePlus2 size={19} />

          <span>New Quotation</span>
        </button>

      </div>

      {/* ===================================================
          STATISTICS
          =================================================== */}

      <div className="stats-grid no-print">

        <div className="stat-card">

          <div className="stat-icon">
            <FileText size={24} />
          </div>

          <div className="stat-content">
            <span>Total Quotations</span>

            <strong>
              {quotations.length}
            </strong>
          </div>

        </div>

      </div>

      {/* ===================================================
          QUOTATION HISTORY
          =================================================== */}

      <div className="quotation-list-card no-print">

        <div className="list-header">

          <div className="list-heading">
            <h2>Quotation History</h2>

            <p>
              View, edit, duplicate, print and
              delete saved quotations.
            </p>
          </div>

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search quotation..."
              aria-label="Search quotation"
            />

            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {filteredQuotations.length === 0 ? (
          <div className="empty-quotation-state">

            <div className="empty-state-icon">
              <FileText size={38} />
            </div>

            <h3>
              {search
                ? 'No matching quotations found'
                : 'No quotations saved yet'}
            </h3>

            <p>
              {search
                ? 'Try another search term.'
                : 'Create your first quotation to see it here.'}
            </p>

          </div>
        ) : (
          <>

            {/* =============================================
                DESKTOP TABLE
                ============================================= */}

            <div className="desktop-quotation-table">

              <div className="table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>Quotation No.</th>

                      <th>
                        Customer / Company
                      </th>

                      <th>Date</th>

                      <th>Subject</th>

                      <th>Rate</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredQuotations.map(
                      (quotation) => (
                        <tr key={quotation.id}>

                          <td>
                            <strong className="quotation-number">
                              {quotation.form
                                ?.quotationNumber ||
                                '-'}
                            </strong>
                          </td>

                          <td>
                            <span className="table-company-name">
                              {getCompanyName(
                                quotation
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              quotation.form?.date
                            )}
                          </td>

                          <td>
                            <span className="table-subject">
                              {getSubject(
                                quotation
                              )}
                            </span>
                          </td>

                          <td>
                            <strong className="table-rate">
                              {formatRate(
                                quotation
                              )}
                            </strong>
                          </td>

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="action-btn view"
                                title="View"
                                onClick={() =>
                                  navigate(
                                    `/quotations/edit/${quotation.id}`
                                  )
                                }
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-btn edit"
                                title="Edit"
                                onClick={() =>
                                  navigate(
                                    `/quotations/edit/${quotation.id}`
                                  )
                                }
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-btn print"
                                title="Print"
                                onClick={() =>
                                  navigate(
                                    `/quotations/edit/${quotation.id}?print=true`
                                  )
                                }
                              >
                                <Printer size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-btn duplicate"
                                title="Duplicate"
                                onClick={() =>
                                  duplicateQuotation(
                                    quotation
                                  )
                                }
                              >
                                <Copy size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-btn delete"
                                title="Delete"
                                onClick={() =>
                                  deleteQuotation(
                                    quotation.id
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =============================================
                MOBILE / TABLET COMPACT LIST
                ============================================= */}

            <div className="mobile-quotation-list">

              {filteredQuotations.map(
                (quotation, index) => (
                  <article
                    className="mobile-quotation-card"
                    key={quotation.id}
                  >

                    {/* CARD TOP */}

                    <div className="mobile-card-top">

                      <div className="mobile-quotation-identity">

                        <span className="mobile-list-index">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <div>
                          <span className="mobile-small-label">
                            Quotation No.
                          </span>

                          <strong className="mobile-quotation-number">
                            {quotation.form
                              ?.quotationNumber ||
                              '-'}
                          </strong>
                        </div>

                      </div>

                      <span className="mobile-rate-badge">
                        {formatRate(
                          quotation
                        )}
                      </span>

                    </div>

                    {/* COMPACT INFORMATION GRID */}

                    <div className="mobile-quotation-info-grid">

                      <div className="mobile-info-item">

                        <Building2 size={14} />

                        <div>
                          <span>Company</span>

                          <strong>
                            {getCompanyName(
                              quotation
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="mobile-info-item">

                        <CalendarDays size={14} />

                        <div>
                          <span>Date</span>

                          <strong>
                            {formatDate(
                              quotation.form?.date
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="mobile-info-item mobile-subject-item">

                        <Hash size={14} />

                        <div>
                          <span>Subject</span>

                          <strong>
                            {getSubject(
                              quotation
                            )}
                          </strong>
                        </div>

                      </div>

                      {formatRate(quotation) !==
                        '-' && (
                        <div className="mobile-info-item mobile-price-item">

                          <Banknote size={14} />

                          <div>
                            <span>Rate</span>

                            <strong>
                              {formatRate(
                                quotation
                              )}
                            </strong>
                          </div>

                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="mobile-card-actions">

                      <button
                        type="button"
                        className="mobile-action-btn view"
                        onClick={() =>
                          navigate(
                            `/quotations/edit/${quotation.id}`
                          )
                        }
                      >
                        <Eye size={15} />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn edit"
                        onClick={() =>
                          navigate(
                            `/quotations/edit/${quotation.id}`
                          )
                        }
                      >
                        <Pencil size={15} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn print"
                        onClick={() =>
                          navigate(
                            `/quotations/edit/${quotation.id}?print=true`
                          )
                        }
                      >
                        <Printer size={15} />
                        <span>Print</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn duplicate"
                        onClick={() =>
                          duplicateQuotation(
                            quotation
                          )
                        }
                      >
                        <Copy size={15} />
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn delete"
                        onClick={() =>
                          deleteQuotation(
                            quotation.id
                          )
                        }
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default Dashboard;