import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Plus,
  Trash2,
  Printer,
  Save,
  PackagePlus,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

import QuotationPreview from '../components/QuotationPreview';

const STORAGE_KEY = 'alFalahQuotations';

const RATE_UNITS = [
  'Per Metric Ton',
  'Per Ton',
  'Per KG',
  'Per Bag',
  'Per Truck',
  'Per Container',
  'Per Maund',
  'Per Unit',
  'Custom',
];

const SPACING_PRESETS = {
  compact: {
    topPadding: 38,
    bottomPadding: 18,
    sidePadding: 17,
    fontSize: 9.5,
    lineHeight: 1.25,
    sectionGap: 6,
    itemGap: 5,
  },

  normal: {
    topPadding: 44,
    bottomPadding: 24,
    sidePadding: 18,
    fontSize: 10.5,
    lineHeight: 1.42,
    sectionGap: 10,
    itemGap: 8,
  },

  spacious: {
    topPadding: 50,
    bottomPadding: 28,
    sidePadding: 20,
    fontSize: 11,
    lineHeight: 1.6,
    sectionGap: 15,
    itemGap: 12,
  },
};

const createId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

const createDefaultItem = () => ({
  id: createId(),
  coalName: 'LOCAL COAL',
  deliveryType: 'Delivered',
  size: '',
  description: '',
  rate: '',
  currency: 'PKR',
  rateUnit: 'Per Metric Ton',
  customRateUnit: '',
  taxLabel: 'Excl. GST',
});

const createDefaultSpecifications = () => [
  {
    id: createId(),
    name: 'GCV',
    value: '',
  },
  {
    id: createId(),
    name: 'Normal Sulphur',
    value: '',
  },
  {
    id: createId(),
    name: 'Normal Ash',
    value: '',
  },
  {
    id: createId(),
    name: 'Moisture',
    value: '',
  },
];

const createDefaultTerms = () => [
  {
    id: createId(),
    text: 'Quotation Validity: 03 days.',
  },
  {
    id: createId(),
    text:
      'Require 07 working days on receipt of purchase order for delivery.',
  },
  {
    id: createId(),
    text:
      'Please note variation in transportation cost and coal prices prevailed at the time of delivery is applicable. Therefore always confirm price before placement of order.',
  },
  {
    id: createId(),
    text:
      'All payments should be made through cross cheque in favor of AL FALAH COAL TRADER.',
  },
  {
    id: createId(),
    text:
      'Premium / Penalty will be applicable as per ASTM Method.',
  },
];

const getNextQuotationNumber = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );

    const year = new Date().getFullYear();

    const usedNumbers = saved
      .map(
        (quotation) =>
          quotation?.form?.quotationNumber ||
          quotation?.quotationNumber ||
          ''
      )
      .filter((number) =>
        number.startsWith(`AFC-${year}-`)
      )
      .map((number) => {
        const parts = number.split('-');
        return Number(parts[parts.length - 1]) || 0;
      });

    const nextNumber =
      usedNumbers.length > 0
        ? Math.max(...usedNumbers) + 1
        : 1;

    return `AFC-${year}-${String(
      nextNumber
    ).padStart(3, '0')}`;
  } catch {
    return `AFC-${new Date().getFullYear()}-001`;
  }
};

function CreateQuotation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);
  const shouldAutoPrint =
    searchParams.get('print') === 'true';

  const [form, setForm] = useState({
    quotationNumber: getNextQuotationNumber(),
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    address: '',
    subject: 'QUOTATION FOR LOCAL COAL',
    salutation: 'Dear Sir,',

    introduction:
      'We are thankful for your interest in local coal. We feel confident that we can give you a consistent and quality coal supply on regular basis. Also it is our utmost desire to serve you at our best by both quality and competitive pricing of top quality coal. Furthermore we would like to offer you the following coal.',

    queryText:
      'Should you have any query, please feel free to contact us.',

    closingText: 'Kind Regard,',
    signatoryName: 'Muhammad Abbas',
  });

  const [items, setItems] = useState([
    createDefaultItem(),
  ]);

  const [specifications, setSpecifications] = useState(
    createDefaultSpecifications()
  );

  const [terms, setTerms] = useState(
    createDefaultTerms()
  );

  const [spacingMode, setSpacingMode] =
    useState('normal');

  const [documentSettings, setDocumentSettings] =
    useState(SPACING_PRESETS.normal);

  const [saveMessage, setSaveMessage] =
    useState('');

  const [quotationLoaded, setQuotationLoaded] =
    useState(!isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      setQuotationLoaded(true);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );

      const quotation = saved.find(
        (item) => String(item.id) === String(id)
      );

      if (!quotation) {
        alert('Quotation not found.');
        navigate('/');
        return;
      }

      setForm((previous) => ({
        ...previous,
        ...(quotation.form || {}),
      }));

      setItems(
        Array.isArray(quotation.items) &&
          quotation.items.length
          ? quotation.items
          : [createDefaultItem()]
      );

      setSpecifications(
        Array.isArray(quotation.specifications)
          ? quotation.specifications
          : createDefaultSpecifications()
      );

      setTerms(
        Array.isArray(quotation.terms)
          ? quotation.terms
          : createDefaultTerms()
      );

      if (quotation.documentSettings) {
        setDocumentSettings({
          ...SPACING_PRESETS.normal,
          ...quotation.documentSettings,
        });

        setSpacingMode(
          quotation.spacingMode || 'custom'
        );
      }

      setQuotationLoaded(true);
    } catch (error) {
      console.error(
        'Unable to load quotation:',
        error
      );

      alert('Unable to load this quotation.');
    }
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (
      !quotationLoaded ||
      !isEditMode ||
      !shouldAutoPrint
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    quotationLoaded,
    isEditMode,
    shouldAutoPrint,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const changeSpacingPreset = (mode) => {
    setSpacingMode(mode);

    if (SPACING_PRESETS[mode]) {
      setDocumentSettings({
        ...SPACING_PRESETS[mode],
      });
    }
  };

  const updateDocumentSetting = (field, value) => {
    setSpacingMode('custom');

    setDocumentSettings((previous) => ({
      ...previous,
      [field]: Number(value),
    }));
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      createDefaultItem(),
    ]);
  };

  const updateItem = (
    itemId,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const deleteItem = (itemId) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (item) => item.id !== itemId
      );
    });
  };

  const addSpecification = () => {
    setSpecifications((previous) => [
      ...previous,
      {
        id: createId(),
        name: '',
        value: '',
      },
    ]);
  };

  const updateSpecification = (
    specificationId,
    field,
    value
  ) => {
    setSpecifications((previous) =>
      previous.map((item) =>
        item.id === specificationId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const deleteSpecification = (
    specificationId
  ) => {
    setSpecifications((previous) =>
      previous.filter(
        (item) => item.id !== specificationId
      )
    );
  };

  const addTerm = () => {
    setTerms((previous) => [
      ...previous,
      {
        id: createId(),
        text: '',
      },
    ]);
  };

  const updateTerm = (termId, value) => {
    setTerms((previous) =>
      previous.map((term) =>
        term.id === termId
          ? {
              ...term,
              text: value,
            }
          : term
      )
    );
  };

  const deleteTerm = (termId) => {
    setTerms((previous) =>
      previous.filter(
        (term) => term.id !== termId
      )
    );
  };

  const quotationData = useMemo(
    () => ({
      form,
      items,
      specifications,
      terms,
      spacingMode,
      documentSettings,
    }),
    [
      form,
      items,
      specifications,
      terms,
      spacingMode,
      documentSettings,
    ]
  );

  const saveQuotation = (
    showAlert = true
  ) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ||
          '[]'
      );

      const now = new Date().toISOString();
      const quotationId = isEditMode
        ? id
        : createId();

      const oldQuotation = saved.find(
        (item) =>
          String(item.id) === String(id)
      );

      const quotation = {
        id: quotationId,
        ...quotationData,

        createdAt: isEditMode
          ? oldQuotation?.createdAt || now
          : now,

        updatedAt: now,
      };

      let updatedQuotations;

      if (isEditMode) {
        updatedQuotations = saved.map(
          (item) =>
            String(item.id) === String(id)
              ? quotation
              : item
        );
      } else {
        updatedQuotations = [
          quotation,
          ...saved,
        ];
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedQuotations)
      );

      window.dispatchEvent(
        new Event('quotation-storage-updated')
      );

      setSaveMessage(
        isEditMode
          ? 'Quotation updated successfully.'
          : 'Quotation saved successfully.'
      );

      window.setTimeout(() => {
        setSaveMessage('');
      }, 3000);

      if (showAlert) {
        alert(
          isEditMode
            ? 'Quotation updated successfully.'
            : 'Quotation saved successfully.'
        );
      }

      return quotationId;
    } catch (error) {
      console.error('Save error:', error);
      alert('Unable to save quotation.');
      return null;
    }
  };

  const handleSave = () => {
    const savedId = saveQuotation(false);

    if (!savedId) {
      return;
    }

    alert(
      isEditMode
        ? 'Quotation updated successfully.'
        : 'Quotation saved successfully.'
    );

    if (!isEditMode) {
      navigate(
        `/quotations/edit/${savedId}`,
        {
          replace: true,
        }
      );
    }
  };

  const handlePrint = () => {
    const savedId = saveQuotation(false);

    if (!savedId) {
      return;
    }

    window.setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="create-page">
      <div className="create-topbar no-print">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={19} />
          Dashboard
        </button>

        <div className="topbar-center">
          {saveMessage && (
            <span className="save-success-message">
              {saveMessage}
            </span>
          )}
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={handlePrint}
          >
            <Printer size={18} />
            Print / Save PDF
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={handleSave}
          >
            <Save size={18} />

            {isEditMode
              ? 'Update Quotation'
              : 'Save Quotation'}
          </button>
        </div>
      </div>

      <div className="quotation-workspace">
        <section className="quotation-form-panel no-print">
          <div className="form-title">
            <div className="form-title-icon">
              <FileText size={24} />
            </div>

            <div>
              <h1>
                {isEditMode
                  ? 'Edit Quotation'
                  : 'Create New Quotation'}
              </h1>

              <p>
                Fill the required fields. Only entered
                information will appear on the final
                quotation.
              </p>
            </div>
          </div>

          <div className="form-section document-spacing-section">
            <div className="section-title-row">
              <div>
                <h3>
                  <SlidersHorizontal size={18} />
                  Document Spacing
                </h3>

                <p className="section-helper">
                  Reduce or increase quotation spacing
                  without changing the content.
                </p>
              </div>
            </div>

            <div className="spacing-presets">
              {[
                ['compact', 'Compact'],
                ['normal', 'Normal'],
                ['spacious', 'Spacious'],
                ['custom', 'Custom'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    spacingMode === value
                      ? 'spacing-preset-btn active'
                      : 'spacing-preset-btn'
                  }
                  onClick={() =>
                    changeSpacingPreset(value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="spacing-controls-grid">
              <label>
                <span>
                  Top Space:
                  <strong>
                    {documentSettings.topPadding}mm
                  </strong>
                </span>

                <input
                  type="range"
                  min="25"
                  max="70"
                  step="1"
                  value={
                    documentSettings.topPadding
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'topPadding',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Bottom Space:
                  <strong>
                    {documentSettings.bottomPadding}mm
                  </strong>
                </span>

                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={
                    documentSettings.bottomPadding
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'bottomPadding',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Side Space:
                  <strong>
                    {documentSettings.sidePadding}mm
                  </strong>
                </span>

                <input
                  type="range"
                  min="10"
                  max="35"
                  step="1"
                  value={
                    documentSettings.sidePadding
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'sidePadding',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Font Size:
                  <strong>
                    {documentSettings.fontSize}pt
                  </strong>
                </span>

                <input
                  type="range"
                  min="8"
                  max="14"
                  step="0.5"
                  value={
                    documentSettings.fontSize
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'fontSize',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Line Height:
                  <strong>
                    {documentSettings.lineHeight}
                  </strong>
                </span>

                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={
                    documentSettings.lineHeight
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'lineHeight',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Section Gap:
                  <strong>
                    {documentSettings.sectionGap}px
                  </strong>
                </span>

                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={
                    documentSettings.sectionGap
                  }
                  onChange={(event) =>
                    updateDocumentSetting(
                      'sectionGap',
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Quotation Number</label>

                <input
                  name="quotationNumber"
                  value={form.quotationNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Customer / Company Name
              </label>

              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Example: ABC Industries (Pvt.) Ltd."
              />
            </div>

            <div className="form-group">
              <label>Customer Address</label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter customer address"
              />
            </div>

            <div className="form-group">
              <label>Subject</label>

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Salutation</label>

              <input
                name="salutation"
                value={form.salutation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Introduction</label>

              <textarea
                className="large-textarea"
                name="introduction"
                value={form.introduction}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-title-row">
              <div>
                <h3>Coal Items</h3>

                <p className="section-helper">
                  Add one or multiple coal items.
                </p>
              </div>

              <button
                type="button"
                className="add-spec-btn"
                onClick={addItem}
              >
                <PackagePlus size={17} />
                Add Item
              </button>
            </div>

            <div className="items-editor">
              {items.map((item, index) => (
                <div
                  className="item-editor-card"
                  key={item.id}
                >
                  <div className="item-editor-header">
                    <div>
                      <span className="item-number">
                        ITEM {index + 1}
                      </span>

                      <strong>
                        {item.coalName ||
                          'New Coal Item'}
                      </strong>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="remove-card-btn"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Coal Name / Type
                      </label>

                      <input
                        value={item.coalName}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'coalName',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Delivery Type</label>

                      <select
                        value={item.deliveryType}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'deliveryType',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Do not show
                        </option>
                        <option value="Delivered">
                          Delivered
                        </option>
                        <option value="Ex-Stock">
                          Ex-Stock
                        </option>
                        <option value="Ex-Mine">
                          Ex-Mine
                        </option>
                        <option value="FOB">
                          FOB
                        </option>
                        <option value="CIF">
                          CIF
                        </option>
                        <option value="Custom">
                          Custom
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Size</label>

                      <input
                        value={item.size}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'size',
                            event.target.value
                          )
                        }
                        placeholder="Example: 00-50mm"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'description',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="form-grid three-column-grid">
                    <div className="form-group">
                      <label>Currency</label>

                      <select
                        value={item.currency}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'currency',
                            event.target.value
                          )
                        }
                      >
                        <option value="PKR">
                          PKR
                        </option>
                        <option value="USD">
                          USD
                        </option>
                        <option value="AED">
                          AED
                        </option>
                        <option value="">
                          No Currency
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Rate / Price</label>

                      <input
                        type="number"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'rate',
                            event.target.value
                          )
                        }
                        placeholder="52800"
                      />
                    </div>

                    <div className="form-group">
                      <label>Rate Unit</label>

                      <select
                        value={item.rateUnit}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'rateUnit',
                            event.target.value
                          )
                        }
                      >
                        {RATE_UNITS.map((unit) => (
                          <option
                            key={unit}
                            value={unit}
                          >
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {item.rateUnit === 'Custom' && (
                    <div className="form-group">
                      <label>
                        Custom Rate Unit
                      </label>

                      <input
                        value={
                          item.customRateUnit
                        }
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'customRateUnit',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      Tax / Price Column Label
                    </label>

                    <input
                      value={item.taxLabel}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          'taxLabel',
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="section-title-row">
              <div>
                <h3>Coal Specifications</h3>
                <p className="section-helper">
                  Empty specifications will not
                  appear on paper.
                </p>
              </div>

              <button
                type="button"
                className="add-spec-btn"
                onClick={addSpecification}
              >
                <Plus size={17} />
                Add Specification
              </button>
            </div>

            <div className="specification-editor">
              {specifications.map(
                (specification) => (
                  <div
                    className="spec-editor-row"
                    key={specification.id}
                  >
                    <input
                      placeholder="Specification"
                      value={specification.name}
                      onChange={(event) =>
                        updateSpecification(
                          specification.id,
                          'name',
                          event.target.value
                        )
                      }
                    />

                    <input
                      placeholder="Value"
                      value={specification.value}
                      onChange={(event) =>
                        updateSpecification(
                          specification.id,
                          'value',
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-spec-btn"
                      onClick={() =>
                        deleteSpecification(
                          specification.id
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-title-row">
              <div>
                <h3>Terms & Conditions</h3>

                <p className="section-helper">
                  Only non-empty terms will appear
                  in PDF.
                </p>
              </div>

              <button
                type="button"
                className="add-spec-btn"
                onClick={addTerm}
              >
                <Plus size={17} />
                Add Term
              </button>
            </div>

            <div className="terms-editor">
              {terms.map((term, index) => (
                <div
                  className="term-editor-row"
                  key={term.id}
                >
                  <span className="term-index">
                    {index + 1}
                  </span>

                  <textarea
                    value={term.text}
                    onChange={(event) =>
                      updateTerm(
                        term.id,
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="remove-spec-btn"
                    onClick={() =>
                      deleteTerm(term.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Closing & Signature</h3>

            <div className="form-group">
              <label>
                Query / Contact Message
              </label>

              <textarea
                name="queryText"
                value={form.queryText}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Closing Text</label>

                <input
                  name="closingText"
                  value={form.closingText}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Signatory Name</label>

                <input
                  name="signatoryName"
                  value={form.signatoryName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>
<section className="preview-panel">
  <QuotationPreview
    form={form}
    items={items}
    specifications={specifications}
    terms={terms}
    documentSettings={documentSettings}
  />
</section>
      </div>
    </div>
  );
}

export default CreateQuotation;