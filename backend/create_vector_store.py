# backend/create_vector_store.py
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

def main():
    print("--- Creating Vector Knowledge Base ---")
    
    # 1. Load documents from our knowledge_base folder
    loader = DirectoryLoader('knowledge_base/', glob="**/*.txt")
    documents = loader.load()
    print(f"Loaded {len(documents)} document sections.")
    
    # 2. Split documents into smaller, manageable chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.split_documents(documents)
    print(f"Split documents into {len(docs)} chunks.")

    # 3. Use a powerful open-source model to create embeddings (numerical representations)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # 4. Create the FAISS vector store and save it locally
    try:
        db = FAISS.from_documents(docs, embeddings)
        db.save_local("faiss_index")
        print("✅ Successfully created and saved the FAISS vector store in 'faiss_index' folder.")
    except Exception as e:
        print(f"❌ Error creating vector store: {e}")

if __name__ == '__main__':
    main()