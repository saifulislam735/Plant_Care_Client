import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Code = () => {
  const [openSections, setOpenSections] = useState({
    imports: true,
    constants: false,
    preprocessing: false,
    classWeights: false,
    modelSetup: false,
    modelCompilation: false,
    modelTraining: false,
    modelEvaluation: false,
    modelSaving: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const codeSnippets = {
    imports: `import tensorflow as tf
from tensorflow.keras import models, layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import numpy as np
import pandas as pd
import sklearn
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import os`,
    constants: `# Constants
IMAGE_SIZE = 256
BATCH_SIZE = 16
CHANNELS = 3
EPOCHS = 50
DATA_DIR = "/kaggle/input/plantvillage-dataset/PlantVillage"

# List classes
classes = os.listdir(DATA_DIR)
print("Total classes:", len(classes))
print("Class names:", classes)`,
    preprocessing: `# Data augmentation for training and validation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=40,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True,
    vertical_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest',
    validation_split=0.2
)

# Training data generator
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='sparse',
    subset='training',
    shuffle=True
)

# Validation data generator
validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='sparse',
    subset='validation',
    shuffle=False
)`,
    classWeights: `# Print class distribution
train_class_counts = np.bincount(train_generator.classes)
val_class_counts = np.bincount(validation_generator.classes)
print("Training class distribution:", dict(zip(classes, train_class_counts)))
print("Validation class distribution:", dict(zip(classes, val_class_counts)))

# Verify class indices
if len(train_generator.classes) == 0:
    raise ValueError("train_generator.classes is empty. Check data directory and generator setup.")
unique_classes = np.unique(train_generator.classes)
if len(unique_classes) != 3:
    raise ValueError(f"Expected 3 unique classes, found {len(unique_classes)}: {unique_classes}")

# Compute class weights
try:
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=unique_classes,
        y=train_generator.classes
    )
    class_weight_dict = dict(enumerate(class_weights))
except Exception as e:
    print(f"Error computing class weights: {e}")
    # Fallback: Manual weights based on class distribution (1000, 1000, 912)
    total_images = [1000, 1000, 912]
    class_weight_dict = {i: sum(total_images) / (len(total_images) * count) for i, count in enumerate(total_images)}
print("Class weights:", class_weight_dict)

# Verify class_weight_dict
if not class_weight_dict:
    raise ValueError("class_weight_dict is empty. Cannot proceed with training.")`,
    modelSetup: `# Model setup
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3))
base_model.trainable = False  # Freeze all layers
for layer in base_model.layers[-20:]:  # Unfreeze last 20 layers
    layer.trainable = True

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.5)(x)  # Add dropout to reduce overfitting
predictions = Dense(3, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)`,
    modelCompilation: `# Compile model with lower learning rate
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
model.summary()`,
    modelTraining: `# Define callbacks
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)
reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.2,
    patience=5,
    min_lr=1e-7
)

# Train model
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    class_weight=class_weight_dict,
    callbacks=[early_stopping, reduce_lr],
    verbose=1
)`,
    modelEvaluation: `# Evaluate model
val_loss, val_accuracy = model.evaluate(validation_generator)
print(f"Validation Loss: {val_loss:.4f}")
print(f"Validation Accuracy: {val_accuracy:.4f}")

# Generate predictions
validation_generator.reset()
y_pred = model.predict(validation_generator)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = validation_generator.classes

# Classification report
print("Classification Report:")
print(classification_report(y_true, y_pred_classes, target_names=classes))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred_classes)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('True')
plt.show()`,
    modelSaving: `# Save model
model.save('potato_disease_model_kag_1.keras')`,
  };

  return (
    <div className="min-h-screen bg-white  text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold mb-10 text-center bg-clip-text text-transparent text-black">
          Potato Disease Model Training Code
        </h1>

        {/* Imports */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75  transition-all duration-300"
            onClick={() => toggleSection('imports')}
          >
            <span>1. Imports</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.imports ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.imports ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.imports}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.imports}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy imports code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Constants */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('constants')}
          >
            <span>2. Constants and Dataset Setup</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.constants ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.constants ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.constants}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.constants}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy constants code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Data Preprocessing */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 hover:bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('preprocessing')}
          >
            <span>3. Data Preprocessing</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.preprocessing ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.preprocessing ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.preprocessing}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.preprocessing}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy preprocessing code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Class Weights */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('classWeights')}
          >
            <span>4. Class Weights Computation</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.classWeights ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.classWeights ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.classWeights}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.classWeights}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy class weights code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Model Setup */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('modelSetup')}
          >
            <span>5. Model Setup</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.modelSetup ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.modelSetup ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.modelSetup}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.modelSetup}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy model setup code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Model Compilation */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('modelCompilation')}
          >
            <span>6. Model Compilation</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.modelCompilation ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.modelCompilation ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.modelCompilation}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.modelCompilation}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy model compilation code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Model Training */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('modelTraining')}
          >
            <span>7. Model Training</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.modelTraining ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.modelTraining ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.modelTraining}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.modelTraining}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy model training code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Model Evaluation */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('modelEvaluation')}
          >
            <span>8. Model Evaluation</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.modelEvaluation ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.modelEvaluation ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.modelEvaluation}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.modelEvaluation}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy model evaluation code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Model Saving */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 flex items-center cursor-pointer p-4 rounded-lg bg-black bg-opacity-75 transition-all duration-300"
            onClick={() => toggleSection('modelSaving')}
          >
            <span>9. Model Saving</span>
            <svg
              className={`ml-2 w-5 h-5 transform transition-transform duration-300 ${
                openSections.modelSaving ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </h2>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openSections.modelSaving ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="relative bg-gray-900 rounded-lg shadow-lg">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {codeSnippets.modelSaving}
              </SyntaxHighlighter>
              <CopyToClipboard text={codeSnippets.modelSaving}>
                <button
                  className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-200"
                  aria-label="Copy model saving code"
                >
                  Copy
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
