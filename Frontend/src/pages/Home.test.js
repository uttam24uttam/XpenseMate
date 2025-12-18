import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import jsPDF from 'jspdf';
import axios from 'axios';

jest.mock('jspdf');
jest.mock('axios');

describe('Home Component', () => {
    test('renders table columns correctly', () => {
        render(<Home />);

        const dateColumn = screen.getByText('Date');
        const amountColumn = screen.getByText('Amount');
        const typeColumn = screen.getByText('Type');
        const categoryColumn = screen.getByText('Category');
        const actionColumn = screen.getByText('Action');

        expect(dateColumn).toBeInTheDocument();
        expect(amountColumn).toBeInTheDocument();
        expect(typeColumn).toBeInTheDocument();
        expect(categoryColumn).toBeInTheDocument();
        expect(actionColumn).toBeInTheDocument();
    });

    test('download PDF button triggers jsPDF', () => {
        render(<Home />);

        const downloadButton = screen.getByText('Download PDF');
        fireEvent.click(downloadButton);

        expect(jsPDF).toHaveBeenCalled();
        const docInstance = jsPDF.mock.instances[0];
        expect(docInstance.autoTable).toHaveBeenCalled();
        expect(docInstance.text).toHaveBeenCalledWith('Transaction Data', 14, 15);
        expect(docInstance.save).toHaveBeenCalledWith('transaction_data.pdf');
    });

    test('fetches and displays transactions', async () => {
        const transactions = [
            { date: '2023-01-01', amount: 100, type: 'income', category: 'salary' },
            { date: '2023-01-02', amount: 50, type: 'expense', category: 'food' },
        ];
        axios.post.mockResolvedValue({ data: transactions });

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('2023-01-01')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('income')).toBeInTheDocument();
            expect(screen.getByText('salary')).toBeInTheDocument();
            expect(screen.getByText('2023-01-02')).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
            expect(screen.getByText('expense')).toBeInTheDocument();
            expect(screen.getByText('food')).toBeInTheDocument();
        });
    });

    test('deletes a transaction', async () => {
        const transactions = [
            { _id: '1', date: '2023-01-01', amount: 100, type: 'income', category: 'salary' },
        ];
        axios.post.mockResolvedValueOnce({ data: transactions });
        axios.post.mockResolvedValueOnce({ data: [] });

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('2023-01-01')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('2023-01-01')).not.toBeInTheDocument();
        });
    });
});
