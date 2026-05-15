package com.financial.management.domain.service;

import com.financial.management.api.dto.CategoriaRequestDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.CategoriaRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private static final String RECEITA = "RECEITA";
    private static final String DESPESA = "DESPESA";

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoRepository transacaoRepository;

    @Transactional(readOnly = true)
    public List<Categoria> listarPorUsuario(UUID usuarioId) {
        return categoriaRepository.findByUsuario_IdOrUsuarioIsNull(usuarioId)
            .stream()
            .sorted(
                Comparator.comparing(Categoria::getTipo, String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(Categoria::getNome, String.CASE_INSENSITIVE_ORDER)
            )
            .toList();
    }

    @Transactional
    public Categoria criarCategoria(UUID usuarioId, CategoriaRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado para o id: " + usuarioId));

        Categoria categoria = Categoria.builder()
            .nome(normalizarTextoObrigatorio(request.nome()))
            .tipo(normalizarTipo(request.tipo()))
            .cor(normalizarCor(request.cor()))
            .usuario(usuario)
            .build();

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categoria atualizarCategoria(UUID categoriaId, UUID usuarioId, CategoriaRequestDTO request) {
        Categoria categoria = buscarCategoriaDoUsuario(categoriaId, usuarioId);

        categoria.setNome(normalizarTextoObrigatorio(request.nome()));
        categoria.setTipo(normalizarTipo(request.tipo()));
        categoria.setCor(normalizarCor(request.cor()));

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void deletarCategoria(UUID categoriaId, UUID usuarioId) {
        Categoria categoria = buscarCategoriaDoUsuario(categoriaId, usuarioId);

        if (transacaoRepository.existsByCategoria_Id(categoriaId)) {
            throw new IllegalArgumentException("Não é possível excluir uma categoria que já possui transações vinculadas.");
        }

        categoriaRepository.delete(categoria);
    }

    private Categoria buscarCategoriaDoUsuario(UUID categoriaId, UUID usuarioId) {
        Categoria categoria = categoriaRepository.findById(categoriaId)
            .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada para o id: " + categoriaId));

        if (categoria.getUsuario() == null) {
            throw new IllegalArgumentException("Categorias globais não podem ser alteradas ou excluídas pelo usuário.");
        }

        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new EntityNotFoundException("Categoria não encontrada para o usuário informado.");
        }

        return categoria;
    }

    private String normalizarTextoObrigatorio(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O valor informado não pode ser vazio.");
        }

        return valor.trim();
    }

    private String normalizarTipo(String tipo) {
        String tipoNormalizado = normalizarTextoObrigatorio(tipo).toUpperCase(Locale.ROOT);

        if (!RECEITA.equals(tipoNormalizado) && !DESPESA.equals(tipoNormalizado)) {
            throw new IllegalArgumentException("Tipo de categoria inválido.");
        }

        return tipoNormalizado;
    }

    private String normalizarCor(String cor) {
        if (cor == null || cor.isBlank()) {
            return null;
        }

        return cor.trim().toUpperCase(Locale.ROOT);
    }
}